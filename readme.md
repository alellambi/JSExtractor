
# Generador de Explotaciones

**¡¡Antes de comenzar!! El script requiere de un archivo .docx como *template*. Lo buscará por defecto en la carpeta un nivel superior a la que aloja a *extractor.js*. Si queres cambiar su ubicación o su nombre, podes modificar el archivo **config.json** la propiedad *"templateFile"***

Ejecutar el script *extractor.js*. Se le solicitará el link de la noticia a extraer (***IMPORTANTE!** Solo funciona con los 4 medios principales*)
Posteriormente se le solicitará el nombre que quiere ponersele al archivo a generar.
El script se encargará de descargar y darle estilos a los elementos y guardarlos en un nuevo archivo .docx.

Proyecto realizado utilizando Node v20.18

## Problemas que me he encontrado con este proyecto

### Loops

Al iterar entre todos los nodos del contenedor scrapeado, no respetaba el orden, por lo cual era un problema de asincronía. Estaba utilizando un *ForEach*.

#### Diferenciar Loops

- **for**

~~~ JS
for (init, condition, afterthought) {}
~~~

- **for in**

~~~ JS
for (const key in object){}
~~~

- **for of**

~~~ JS
for (const item of arr) {}
~~~

Dado que necesitaba ejecutar una funcion en cada una de las iteraciones, utilice **foreach**. Sin embargo me tope con el problema de que forEach no itera de forma **sincrónica** por lo que *no esperaba a que finalice una para iniciar la siguiente*, lo que generaba que los nodos quedaran mezclados. Es por ello que debí modificarla por un **For Of**.

**.map()**
**forEach** => NO RETORNA NINGUN VALOR, mas rápido. **Modifica el array ORIGINAL**
**map** => RETORNA EL VALOR FINAL, mas lento. **Genera un nuevo ARRAY**

#### Conclusión

- NO USAR FOR EACH EN CASOS DE ASINCRONÍA
