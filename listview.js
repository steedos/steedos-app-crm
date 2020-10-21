const _ = require('underscore');
const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");

//扫描objects目录下的所有文件,并解析
function scanFiles(sanFilesPath,creatFilesPath){
    
    fs.readdir(sanFilesPath, function(err, files){
        var dirs = [];      
        (function iterator(i){
            if(i == files.length) {               
               
                for(let j=0; j< dirs.length; j++){
           
                    if(dirs[j].indexOf(".object.yml") > -1){

                        let contents = fs.readFileSync(sanFilesPath + '/'+ dirs[j],'utf-8'); 
                        let objYml = yaml.load(contents);
                        let objectName = objYml.name;
                        //console.log("objYml.name====="+objYml.name);
                        
                        //获取特定object属性
                        _.map(objYml.list_views, function(value,key){           
                            let listViewName = key;
                            let listView = value;
                            //console.log("listViewName===="+listViewName);
                            //console.log(value);

                            //生成特定目录的对象文件
                            let folderName = creatFilesPath + '/'+ objectName+ '/listViews';
                            let fileName =  listViewName + '.listView.yml';

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
                            let ymlData = yaml.dump(listView)
                            fs.writeFileSync(folderName + '/' + fileName, ymlData);

                        })

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


exports.listViewToLocalFile = function(){
    let sanFilesPath = "./src/objects";
    let creatFilesPath = "./steedos-app/main/default/objects";
    scanFiles(sanFilesPath,creatFilesPath);
}

this.listViewToLocalFile();