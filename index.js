const objectToLocalFile = require('./object').objectToLocalFile
const fieldToLocalFile = require('./field').fieldToLocalFile
const listViewToLocalFile = require('./listview').listViewToLocalFile

function toLoalFile(){
    console.log('toLoalFile is running...');
    objectToLocalFile();
    console.log('objectToLocalFile finished ');
    fieldToLocalFile();
    console.log('fieldToLocalFile finished ');
    listViewToLocalFile();
    console.log('listViewToLocalFile finished ');
}

toLoalFile();