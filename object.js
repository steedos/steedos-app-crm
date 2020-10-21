//读取yml文件，获取对象基本属性，生成对应的yml文件 
const _ = require('underscore');
const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");

//扫描objects目录下的所有文件,并解析
function scanFiles(sanFilesPath){

    fs.readdir(sanFilesPath, function(err, files){
        var dirs = [];      
        (function iterator(i){
            if(i == files.length) {               
                //results.push(dirs);
                for(let j=0; j< dirs.length; j++){
                    //console.log(dirs[j]);
                    if(dirs[j].indexOf(".object.yml") > -1){
                        //console.log(dirs[j]);
                        //getObjectOfYaml(dirs[j]);
                        let contents = fs.readFileSync(sanFilesPath + '/'+ dirs[j],'utf-8'); 
                        let objYml = yaml.load(contents);
                        let objectName = objYml.name;
                        //console.log("objYml.name====="+objYml.name);
                        
                        //获取特定object属性
                        let objContent = {};
                        _.map(objYml, function(value,key){           
                            if(key!=='fields' 
                            && key !== 'list_views' 
                            && key !=='actions' 
                            && key !=='permission_set'
                            && key != 'triggers'
                            && key != 'record_permissions'){

                                objContent[key] = value;
                            }
                        })
                        //生成特定目录的对象文件
                        let objectsFolderName = './steedos-app';
                        try{
                            fs.statSync(objectsFolderName);
                        }catch(e){
                            //目录不存在的情况下       
                            if(e.code == "ENOENT"){
                                fs.mkdirSync(objectsFolderName);
                            }  
                        }
                        objectsFolderName += '/main';

                        try{
                            fs.statSync(objectsFolderName);
                        }catch(e){
                            //目录不存在的情况下       
                            if(e.code == "ENOENT"){
                                fs.mkdirSync(objectsFolderName);
                            }  
                        }
                        objectsFolderName += '/default';

                        try{
                            fs.statSync(objectsFolderName);
                        }catch(e){
                            //目录不存在的情况下       
                            if(e.code == "ENOENT"){
                                fs.mkdirSync(objectsFolderName);
                            }  
                        }
                        objectsFolderName += '/objects';
                        try{
                            fs.statSync(objectsFolderName);
                        }catch(e){
                            //目录不存在的情况下       
                            if(e.code == "ENOENT"){
                                fs.mkdirSync(objectsFolderName);
                            }  
                        }

                        let folderName = objectsFolderName + "/" + objectName;
                        let fileName =  objectName + '.object.yml';

                        //创建单个对象目录
                        try{
                            fs.statSync(folderName);
                        }catch(e){
                            //目录不存在的情况下       
                            if(e.code == "ENOENT"){
                                fs.mkdirSync(folderName);
                            }  
                        }
                        //console.log(folderName);
                        let ymlData = yaml.safeDump(objContent);
                        fs.writeFileSync(folderName + '/' + fileName, ymlData);

                    }
                }
                return;
            }
            fs.stat(path.join(sanFilesPath, files[i]), function(err, data){     
                if(data.isFile()){               
                    dirs.push(files[i]);
                }
                iterator(i+1);
            });   
        })(0);
    });
}

exports.objectToLocalFile = function(){
    let sanFilesPath = "./src/objects";
    scanFiles(sanFilesPath);
}

this.objectToLocalFile();