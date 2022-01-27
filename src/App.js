import React, { useState } from 'react'
import Canvas from './Canvas.js';
import MainFileHeaderParser from './parser/MainFileHeaderParser';
import MainFileRecordParser from "./parser/MainFileRecordParser";
import Draw from "./Draw";

const App = () =>  {
    const [ mainFileHeader, setMainFileHeader ] = useState({});
    const [ mainFileRecord, setMainFileRecord ] = useState([]);
    const [tolerance, setTolerance] = useState('');

    const onFileChange = (e) => {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(e.target.files[0]);
        fileReader.onload = function(e) {
            const start_time = new Date().getTime();
            const view = new DataView(e.target.result);
            const mainFileHeader = MainFileHeaderParser(view);
            const record = MainFileRecordParser(view, mainFileHeader.fileLength, (mainFileHeader.yMax - mainFileHeader.yMin)/window.innerHeight);
            setMainFileHeader(mainFileHeader);
            setMainFileRecord(record);
            const parser_time = new Date().getTime();
            console.log("parsing 시간: ", (parser_time - start_time)/1000);
        }
    }

    return (
        <div>
            <div className="Input">
                <input type='file' onChange={onFileChange}/>
            </div>
            <hr />
            <div>
                <Canvas style={{width:"100vw", height: "100vh"}} mainFileHeader={mainFileHeader} mainFileRecord={mainFileRecord} />
            </div>
        </div>
    );
}

export default App;