import React from 'react';
import { useRef, useState } from 'react';

const App = () => {
const fileInputRef = useRef(null);
const [photoname,setphotoname] = useState('');
const [file,setfile] =useState(null);
const [inputvalue,setinputvalue]= useState("");
const handleFileChange = (event) => {
  const file = event.target.files[0];

  if (file) {
    setphotoname(file.name);
    setfile(file);
  }
};
  const handlePhotoClick = () => {
  fileInputRef.current.click();
};
const handleSubmit = async () => {
  if(!file || !inputvalue) {
    alert("erro");
    return;
  }
  const formData = new FormData();
  formData.append('photo', file); // <-- use the file state
  formData.append('description', inputvalue);
  try {
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData,
    });
    if(response.ok) {
      const data = await response.json();
      console.log('Success:', data);
      alert("success");
    }
    else {
      console.error('Error:', response.statusText);
      alert("error"); 
    }
  }
  catch (error) {
    console.error('Error:', error);
    alert("error");
  }
};
  return (
    <div>
    <div className=" flex  gap-4 justify-center items-center ">
      <div  onClick={handlePhotoClick} className="border-rounded flex p-5  m-50 border  cursor-pointer justify-center rounded-2xl">{photoname? photoname:'click the photo'}</div>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange}  className="hidden"  />
      <input type="text" value={inputvalue} onChange={(e) => setinputvalue(e.target.value)} placeholder="write description about it "className="border-rounded flex p-5 m-50 border rounded-2xl  justify-center" />
    

    </div>

        <div>
  <button 
    onClick={handleSubmit}
    className="border-rounded rounded-2xl border flex cursor-pointer p-5 m-50 justify-center"
  >
    submit
  </button>
</div>
</div>
  );
}
export default App;