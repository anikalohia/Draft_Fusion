import Link from "next/link";

const Home = ()=>{
  return (
    <div>
      Click <Link href='/documents/123'><span className="text-blue-500 underline">Here</span></Link> to go to document id
    </div>
  )
}
export default Home;