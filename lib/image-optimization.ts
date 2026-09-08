export type ImageOptimizationOptions={maxDimension:number;maxBytes:number;quality?:number};

const acceptedImageTypes=new Set(['image/jpeg','image/png','image/webp']);

export function webpFilename(name:string){
  const stem=name.replace(/\.[^.]+$/,'').trim()||'image';
  return `${stem}.webp`;
}

export function fitImageWithin(width:number,height:number,maxDimension:number){
  const longest=Math.max(width,height);
  if(longest<=maxDimension)return{width,height};
  const ratio=maxDimension/longest;
  return{width:Math.max(1,Math.round(width*ratio)),height:Math.max(1,Math.round(height*ratio))};
}

function canvasBlob(canvas:HTMLCanvasElement,quality:number){
  return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Không thể chuyển ảnh sang WEBP.')),'image/webp',quality));
}

export async function optimizeImageToWebp(file:File,{maxDimension,maxBytes,quality=.82}:ImageOptimizationOptions){
  if(!acceptedImageTypes.has(file.type))throw new Error('Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.');
  if(file.size>20*1024*1024)throw new Error('Ảnh gốc tối đa 20MB.');
  const bitmap=await createImageBitmap(file);
  if(!bitmap.width||!bitmap.height){bitmap.close();throw new Error('Ảnh không hợp lệ hoặc đã bị hỏng.');}
  let size=fitImageWithin(bitmap.width,bitmap.height,maxDimension),currentQuality=quality,blob:Blob|null=null;
  const canvas=document.createElement('canvas'),context=canvas.getContext('2d',{alpha:true});
  if(!context){bitmap.close();throw new Error('Trình duyệt không thể xử lý ảnh này.');}
  for(let attempt=0;attempt<6;attempt++){
    canvas.width=size.width;canvas.height=size.height;
    context.clearRect(0,0,size.width,size.height);context.drawImage(bitmap,0,0,size.width,size.height);
    blob=await canvasBlob(canvas,currentQuality);
    if(blob.size<=maxBytes)break;
    if(currentQuality>.66)currentQuality-=.08;
    else size={width:Math.max(320,Math.round(size.width*.82)),height:Math.max(240,Math.round(size.height*.82))};
  }
  bitmap.close();
  if(!blob||blob.size>maxBytes)throw new Error('Ảnh vẫn quá lớn sau khi tối ưu. Hãy chọn ảnh có độ phân giải thấp hơn.');
  return new File([blob],webpFilename(file.name),{type:'image/webp',lastModified:file.lastModified});
}
