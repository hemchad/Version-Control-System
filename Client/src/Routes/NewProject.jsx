import React,{useCallback, useMemo, useRef, useState} from 'react'
import Big from '../components/Headings/Big'
import Small from '../components/Headings/Small';
import Input from '../components/Core/Input'
import Label from '../components/Core/Label';
import Medium from '../components/Headings/Medium';
import SearchBar from '../components/Utility/SearchBar';
import Button from '../components/Core/Button';

const projectNameRegexp = /^[a-zA-Z0-9_]+(-[a-zA-Z0-9_]+)*$/;
const usernameRegexp = /^[a-zA-Z]+(-[a-zA-Z0-9]+)*$/;

const NewProject = () => {

    const [projectName, setProjectName] = useState({name : '', isValid : true});
    const [techLeadName, setTechLeadName] = useState({name : '', isValid : true});
    const [devName, setDevName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    
    const [devList, setDevList] = useState([]);
    const [files, setFiles] = useState([]);
    const [fileNames, setFileNames] = useState([]);
    const filesRef = useRef();

    const validateProjectName = useCallback((name) => {
        setProjectName({name, isValid : projectNameRegexp.test(name)});
    });

    const validateTechLeadName = useCallback((name) => {
        setTechLeadName({name , isValid : usernameRegexp.test(name)});
    });

    const handleFilesDrop = useCallback((e) => {
        e.preventDefault();
        console.log('File(s) Dropped');
        const names = [];
        const filesAsObj = [];

        if (e.dataTransfer.items) {
            [...e.dataTransfer.items].forEach((item, i) => {
              console.log(item.kind);
              if (item.kind === "file") {
                const file = item.getAsFile();
                filesAsObj.push(file);
                names.push(file.name);
              }
            });
        } else {
            [...e.dataTransfer.files].forEach((file, i) => {
                filesAsObj.push(file);
                names.push(file.name);
            });
        }
        
        setFiles(prevState => [...prevState, ...filesAsObj]);
        setFileNames(prevState => [...prevState, ...names])

    });

    
    const handleFilesSelection = useCallback((e) => {
        const names = [];
        const filesAsObj = [];

        const files = e.target.files;
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                filesAsObj.push(files[i]);
                names.push(files[i].name);
            }
        }
        
        setFiles(prevState => [...prevState, ...filesAsObj]);
        setFileNames(prevState => [...prevState, ...names]);
    });
    
    const addDeveloper = useCallback((e) => {
        const name = e.target.innerText;
        setDevList(prevState => !prevState.includes(name) && techLeadName !== name ? [...prevState, name] : prevState);
        e.target.classList.add('success');
        
    });

    const searchHandler = useCallback(async(name) => {
        if(!usernameRegexp.test(name)){
            setSearchResults([<i className='text-error'>Invalid username, regexp : /^[a-zA-Z]+(-[a-zA-Z0-9]+)*$/</i>]);
            return;
        };

        const res = await fetch(`http://localhost:7888/api/search/dev?devname=${name}`);
        const data = await res.json();

        if(data.isSuccess){
            // const devListArray = new Array(...devList);
            setSearchResults(data.result.map((name, ind) => <p onClick={(e) => {addDeveloper(e)}}
                                                            className={`${(devList.includes(name) || techLeadName === name) && 'text-success italic'}`}>
                                                            {name}
                                                            </p>));
        }

    });

    const handleCreateProject = useCallback((e) => {
        console.log('Creating Project');
    })


    return (
    <>
        <section className='w-3/4 sm-max:w-full'>
            <Big>New Project</Big>
            
            
            <Label><Small>Project Name : </Small></Label>
            <Input name="projectName"
                error={!projectName.isValid}
                placeholder="Enter project name Eg. Tensor-Library-64"
                changeHandler={(e) => {validateProjectName(e.target.value)}}/>
            

            <Label><Small>Tech Lead : </Small></Label>
            <Input name="techLead"
                   error={!techLeadName.isValid}
                   placeholder="Your project's TechLead's username"
                   changeHandler={(e) => {validateTechLeadName(e.target.value)}}/>

            <div className='border-[1px] border-muted rounded-lg p-3 mx-3 my-[5vh] '
                 onDragOver={(e) => {e.preventDefault();}}
                 onDrop={(e) => {handleFilesDrop(e)}}>
                <Small>Drop your project files if any</Small>
                <p className='px-3 mt-4 underline' onClick={(e) => {filesRef.current.click();}}>
                    Browse
                </p>
                <input type="file" 
                       className='invisible' 
                       ref={filesRef}
                       onDragOver={(e) => {e.preventDefault();}}
                       onChange={handleFilesSelection}
                       directory webkitdirectory mozdirectory msdirectory odirectory multiple/>

                <ul>
                    {`${fileNames.length} file(s) dropped`}
                    {fileNames.length > 20 && <Medium>...</Medium>}
                    {fileNames.slice(-20, fileNames.length).map((fileName, ind) => 
                            <li className={`p-2 bg-hover border-[1px] mb-1 border-muted rounded-lg hover:brightness-125`}>
                                {fileName}
                            </li>)}
                </ul>
            </div>

            <Label><Small>Add Developers to Project</Small></Label>
            
            <SearchBar value={devName}
                       setValue={setDevName}
                       searchHandler={searchHandler} 
                       searchResults={searchResults}
                       waitPeriod={500}/>

            <Small>{devList.length} Developers added to Project</Small>
            <div className='grid grid-cols-4 lg-max:grid-cols-2 sm-max:grid-cols-1'>
                { 
                 devList.map((dev, ind) => <div key={ind} className='border-[1px] min-w-[20%] border-muted p-5 m-3 rounded-lg hover'>
                                                <span onClick={(e) => {setDevList(prevState => prevState.filter(name => name !== dev))}} 
                                                    className='relative left-[95%] top-[-15%] hover:brightness-125 hover:cursor-pointer'>✖</span>
                                                <Small>{dev}</Small>
                                            </div>)
                }

            </div>

            <Button clickHandler={(e) => {handleCreateProject(e)}}
                    className={'bg-success w-[70%] sm-max:w-full my-[10vh]'}>
                    Create Project
            </Button>

         </section>
    </>
  )
}

export default NewProject