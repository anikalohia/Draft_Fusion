import { Editor } from "./editor";
import { Toolbar } from "./toolbar";
import { DocumentHeader } from "./DocumentHeader";

interface DocumentIdPageProps {
    params: Promise<{documentId : string}>;
}

const DocumentIdPage = async({params}: DocumentIdPageProps) =>{
    const {documentId} = await params;

    return (
        <div className="min-h-screen bg-[#F9F9F9] flex flex-col font-sans">
            <DocumentHeader documentId={documentId} />
            <div className="py-4 px-8 border-b-4 border-black bg-[#FFD700] shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] z-10 relative flex justify-center">
                <Toolbar/>
            </div>
            <div className="flex-1 overflow-auto bg-[#F9F9F9] bg-[radial-gradient(#C7C7C7_1px,transparent_1px)] [background-size:20px_20px]">
                <Editor/>
            </div>
        </div>
    )
}

export default DocumentIdPage
