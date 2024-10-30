import webs from "./webs.json" with { type: "json" }
import {writeFileSync, readFileSync} from "node:fs"
import { patchDocument, Paragraph, TextRun} from "docx"
import { parse } from "node-html-parser"
import axios from "axios"
import imageSize from "image-size"

import { question } from "readline-sync"
import { PatchType } from "docx"

import { ExternalHyperlink } from "docx"
import { ImageRun } from "docx"
import { HorizontalPositionAlign } from "docx"

import { TextWrappingType } from "docx"
import { TextWrappingSide } from "docx"
import { VerticalPositionRelativeFrom } from "docx"
import { HorizontalPositionRelativeFrom } from "docx"

const TAGS = ["P", "H1", "H2", "H3", "H4", "H5", "FIGCAPTION", "FIGURE", "PICTURE","IMG"]

async function getRequest(url) {
  return await axios.get(url)
      .then((res) => {
        return (res.data)
      })
      .catch((error) => {
        console.error(`Error cargando la noticia \n ${error}`)
      })
}

function getSiteName(url) {
  const regex = /www\.(.*?)\.com/;
  const match = url.match(regex);
  const result = match ? match[1].toUpperCase() : ""
  return result || undefined
}

function htmlContainerParsing(response, config) {
  const parsedContent = parse(response) 
  const containerNode = parsedContent.querySelector(`.${config.container}`)
  return containerNode
}

function getSiteConfig(site) {
  try {
    const config = webs[site] 
    return config
  }
  catch {
    throw new Error("Web No Identificada");
  }
}

function getDate() {
  const today = new Date(); 
  const day = String(today.getDate()).padStart(2, '0'); 
  const monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]; 
  const fullMonth = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"]
  const month = monthNames[today.getMonth()]; 
  const year = String(today.getFullYear()).slice(-2); 
  return {
    fileDate: `${day}${month}${year}`,
    textDate: `${day} DE ${fullMonth[today.getMonth()]} DE 20${year}`
  }
}

function checkTag(node, config) {
  let className, ignore, pass, src
  try { className = node.attributes.class.trim().split(" ")[0] } catch { className = null }
  try { src = node.attributes.src} catch { src = null }
  if (config.ignorar_clases.includes(className)) ignore = true
  else if (node.textContent === "Seguir leyendo") pass = true
  return {
    tag: node.tagName, 
    textContent: node.textContent,
    src: src ,
    ignore: ignore,
    pass: pass
  }
}

function fitImage(image) {
  let width, height
  const originalSize = imageSize(image)
  const aspectRatio = originalSize.width / originalSize.height

  width = 500
  height = width/aspectRatio
  console.log({ width, height})
  return {
    width,
    height 
  }
}

function addImageInArray(src) {
  const image = new ImageRun({
    type: "jpg",
    data: readFileSync(src),
    transformation: fitImage(src),
    floating: {
      horizontalPosition: {
        relative: HorizontalPositionRelativeFrom.PAGE,
        align: HorizontalPositionAlign.CENTER
      },
      verticalPosition: {
        relative: VerticalPositionRelativeFrom.PARAGRAPH,
        offset: 0
      },
      wrap: {
        type: TextWrappingType.TOP_AND_BOTTOM,
        side: TextWrappingSide.BOTH_SIDES
      },
      margins: {
        bottom: 0
      }
    }
  })

  return new Paragraph({
    children: [image]
  })
}

function addTextChildrenInArray(text, tag) {
  if (text === "") return
  const stylesTable ={ 
    'H1': {
      bold: true,
      font: "Century Gothic",
      size: 44,
      allCaps: true,
      underline: {type:"single", color:"000000"}
    },
    'H2': {      
      font: "Century Gothic",
      size: 30,
      bold: true 
    },
    'H3': {      
      font: "Century Gothic",
      size: 24,
    }, 
    'P': {      
      font: "Century Gothic",
      size: 24, 
    },
    'FIGCAPTION': {
      font: "Century Gothic",
      size: 20, 
    }
    
  }
  let style = stylesTable[tag]
  // TODO Descarga de IMAGENES
  if (!style) return

  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        ...style
      }),
    ]
  })
}

async function downloadImage(url) {
  console.log(`Descargando ${url}`)

  const response = await axios({url, responseType: "arraybuffer"})
  writeFileSync(`./images/image.jpg`, response.data)
  
  return `./images/image.jpg`
}

async function addToArray(tag, text, src = null) {
  let content
  if (TAGS.includes(tag) && text !== "Seguir leyendo") {
    if (tag === "IMG") {
      const path = await downloadImage(src)

      content = addImageInArray(path)
    } else { 
      content = addTextChildrenInArray(text, tag)
    }
  }
  return content
}

async function searchNodes(contentArray, node, config) {
  const { tag, textContent, src, ignore, pass } = checkTag(node, config)
  if (ignore) return
  if (!pass) {
    const content = await addToArray(tag, textContent, src)
    if (content) contentArray.push(content)
  }
  if (node.firstChild) {
    const childrenArray = Array.from(node.childNodes)
    for (const child of childrenArray) {
      await searchNodes(contentArray, child, config)
    }
    // const childrenArray = Array.from(node.childNodes)
    // childrenArray.forEach((child) => {
    //   searchNodes(contentArray, child, config)
    // })
  }
}
  
async function patchDocx(initialFile, patchData, fileNameData) {
  await patchDocument({
    outputType: "nodebuffer",
    data: initialFile,
    patches: {
      date: {
        type: PatchType.PARAGRAPH,
        children: [
          new TextRun({
            text: patchData.textDate,
            font: "Century Gothic",
            size: 24, 
            allCaps: true
          })
        ]
      },
      source: {
        type: PatchType.PARAGRAPH,
        children: [
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: patchData.url,
                color: "0000EE",
                underline: {type:"single", color:"0000EE"} 
              }),
            ],
            link: patchData.url
          })
        ]
      },
      my_patch: {
        type: PatchType.DOCUMENT,
        children: patchData.contentArray
      },
    },
    keepOriginalStyles: true
  })
    .then((doc) => {
      writeFileSync(`../${fileNameData.fileDate} - ${fileNameData.title}.docx`, doc)
    })
}
  
async function startApp() {
  let contentArray = []
  console.log("POR EL MOMENTO SOLO INFOBAE - LA NACION - PAGINA 12 - CLARIN")
  
  const url = question("Ingrese el enlace de la noticia: ")
  // Para Testing
  // const test = {
  //   infobae: "https://www.infobae.com/america/ciencia-america/2023/01/20/cada-vez-es-mas-dificil-ver-las-estrellas-detectaron-que-la-contaminacion-luminica-se-duplico-en-12-anos/",
  //   clarin: "https://www.clarin.com/politica/uta-anuncio-paro-colectivos-jueves-31-octubre_0_4fPskhua71.html",
  //   nacion: "https://www.lanacion.com.ar/sociedad/la-uta-anuncio-un-paro-de-colectivos-para-el-jueves-31-de-octubre-en-el-amba-nid28102024/",
  //   pagina12: "https://www.pagina12.com.ar/778211-la-uta-confirmo-un-paro-de-colectivos-para-el-jueves"
  // }
  // const url = test.pagina12
  // console.log(url)
  // Para Testing


  const site = getSiteName(url)
  const config = getSiteConfig(site)
  const {fileDate, textDate} = getDate()
  const response = await getRequest(url)  

  const title = question(`Ingrese el titulo del archivo: ${fileDate} - `).toUpperCase()
  // Para Testing
  // const title = "PRUEBA123"
  // Para Testing

  const container = htmlContainerParsing(response, config)
  await searchNodes(contentArray, container, config)
  const patchData = {textDate, url, contentArray}
  const fileNameData = {fileDate, title}
  const initialFile = readFileSync("../Explotaciones.docx")
  
  await patchDocx(initialFile, patchData, fileNameData)
  

}

startApp()