import React, {useState, useEffect} from 'react';
import type {RootState} from '../redux/store'
import {useSelector, useDispatch} from 'react-redux'

const chunkSize = 10 * 1024

const Dashboard = () => {
    const [dropZoneActive, setDropZoneActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [currentFileIndex, setCurrentFileIndex] = useState<null | number>(null);
    const [lastUploadedFileIndex, setLastUploadedFileIndex] = useState<null | number>(null);
    const [currentChunkIndex, setCurrentChunkIndex] = useState<null | number>(null);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setFiles([...files, ...e.dataTransfer.files]);
    }

    const readAndUploadCurrentChunk = () => {
        const reader = new FileReader();
        const file = files[currentFileIndex!];

        if (!file) {
            return;
        }

        const from = currentChunkIndex! * chunkSize;
        const to = from + chunkSize;
        const blob = file.slice(from, to);
        reader.onload = e => uploadChunk(e);
        reader.readAsDataURL(blob);
    }

    const uploadChunk = async (readerEvent: ProgressEvent<FileReader>) => {
        const file: any = files[currentFileIndex!];
        const fileData = readerEvent.target!.result as string;
        const params = new URLSearchParams();
        params.set('name', file.name);
        params.set('size', file.size.toString());
        params.set('currentChunkIndex', currentChunkIndex!.toString());
        params.set('totalChunks', Math.ceil(file.size / chunkSize).toString());

        const response = await fetch('http://localhost:4000/api/files/upload?' + params, {
            method: 'POST',
            body: fileData,
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        })

        const data = await response.json();

        const filesize = files[currentFileIndex!].size;
        const isLastChunk = currentChunkIndex === Math.ceil(filesize / chunkSize) - 1;

        if (isLastChunk) {
            file.finalFileName = data.finalFileName;
            setLastUploadedFileIndex(currentFileIndex!);
            setCurrentChunkIndex(null);
        } else {
            setCurrentChunkIndex(currentChunkIndex! + 1);
        }
    }

    useEffect(() => {
        if (files.length > 0) {
            if (currentFileIndex === null) {
                setCurrentFileIndex(lastUploadedFileIndex === null ? 0 : lastUploadedFileIndex + 1);
            }
        }
    }, [files.length]);

    useEffect(() => {
        if (currentFileIndex !== null) {
            setCurrentChunkIndex(0);
        }
    }, [currentFileIndex]);

    useEffect(() => {
        if (currentChunkIndex !== null) {
            readAndUploadCurrentChunk();
        }
    }, [currentChunkIndex]);



    return (
        <div>
            <div
                onDragOver={(e) => {
                    setDropZoneActive(true);
                    e.preventDefault();
                }}
                onDragLeave={(e) => {
                    setDropZoneActive(false);
                    e.preventDefault();
                }}
                onDrop={(e) => handleDrop(e)}
                className={"dropzone" + (dropZoneActive ? " active" : "")}>
                Upload Files
            </div>
        </div>
    );
};

export default Dashboard;


// 42:39
// https://www.youtube.com/watch?v=dbYBVbrDnwg