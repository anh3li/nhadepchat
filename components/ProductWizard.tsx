/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ChangeEvent, DragEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Download, Eye, GripVertical, ImagePlus, Star, Trash2, UploadCloud, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { uploadProductFile } from '../lib/upload-product-file';
import { optimizeImageToWebp } from '../lib/image-optimization';
import { ProductCard } from './ProductCard';
import { ProductGallery, ImageViewer } from './ProductGallery';
import { RichTextEditor } from './RichTextEditor';
import { SafeImage } from './SafeImage';

const steps=['Thông tin','Thông số','Hình ảnh','File hồ sơ','Giá & SEO','Xem trước'];
const buildings=['Nhà phố','Nhà cấp 4','Biệt thự','Nhà vườn','Nhà xưởng','Văn phòng','Trường học','Chung cư','Quy hoạch','Nội thất','Công trình khác'];
const styles=['Hiện đại','Tân cổ điển','Cổ điển','Mái Nhật','Mái Thái','Tối giản','Công nghiệp','Khác'];
const formats=['DWG','SKP','RVT','PDF','XLSX','DOCX','ZIP','RAR'];
const disciplines=['Kiến trúc','Kết cấu','Điện','Cấp thoát nước','MEP','PCCC','Nội thất','Phối cảnh','Dự toán','Thuyết minh','Tài liệu','Khác'];
const tools=['AutoCAD','SketchUp','Revit','3ds Max','Excel','ETABS','SAFE','SAP2000','Khác'];
type UploadItem={id:string;name:string;size:number;url?:string;progress:number;kind:'preview'|'file';type?:string;extension?:string;error?:boolean};
type FormDataShape={title:string;category:string;buildingType:string;style:string;shortDescription:string;description:string;width:string;length:string;floors:string;area:string;formats:string[];disciplines:string[];tools:string[];keywords:string[];isFree:boolean;price:string};
const initial:FormDataShape={title:'',category:'Nhà phố',buildingType:'Nhà phố',style:'Hiện đại',shortDescription:'',description:'',width:'',length:'',floors:'',area:'',formats:['DWG'],disciplines:['Kiến trúc'],tools:['AutoCAD'],keywords:[],isFree:true,price:'0'};

export function ProductWizard(){
  const editId=useSearchParams().get('id');
  return <ProductWizardForm key={editId||'new'} editId={editId}/>;
}
function ProductWizardForm({editId}:{editId:string|null}){
  const router=useRouter();
  const [step,setStep]=useState(0),[data,setData]=useState(initial),[productId,setProductId]=useState<string|null>(editId),[uploads,setUploads]=useState<UploadItem[]>([]),[coverId,setCoverId]=useState<string|null>(null),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[keywordInput,setKeywordInput]=useState('');
  const [loadState,setLoadState]=useState<'loading'|'ready'|'error'>(editId?'loading':'ready');
  useEffect(()=>{if(!editId)return;fetch(`/api/marketplace/products?id=${encodeURIComponent(editId)}`).then(async r=>{if(!r.ok)throw new Error('Không tải được bản nháp.');return r.json()}).then((p:any)=>{if(!p.id)throw new Error('Không tìm thấy bản nháp.');const category=buildings.includes(p.category)?p.category:(buildings.includes(p.building_type)?p.building_type:'Công trình khác');setData({...initial,...p,category,buildingType:buildings.includes(p.building_type)?p.building_type:'Công trình khác',style:styles.includes(p.style)?p.style:'Khác',width:p.width||'',length:p.length||'',floors:p.floors||'',area:p.area||'',formats:String(p.formats||'').split(',').filter(Boolean),disciplines:p.disciplines||[],tools:p.tools||[],keywords:p.keywords||[],isFree:!!p.is_free,price:String(p.price||0),shortDescription:p.short_description||''});const assets=(p.assets||[]).map((a:any,i:number)=>({id:a.id,name:`Ảnh preview ${i+1}`,size:0,url:`/api/assets/${a.id}`,progress:100,kind:'preview' as const,type:a.type}));setUploads([...assets,...(p.files||[]).map((f:any)=>({id:f.id,name:f.name,size:f.size,extension:f.extension,progress:100,kind:'file' as const}))]);setCoverId(assets.find((a:UploadItem)=>a.type==='cover')?.id||assets[0]?.id||null);setLoadState('ready')}).catch(()=>{setLoadState('error');setError('Không tải được bản nháp. Vui lòng tải lại trang; nội dung cũ chưa bị thay đổi.')})},[editId]);
  const transferLock=useRef(false), mutationLock=useRef(false);
  const [transferring,setTransferring]=useState(false),[mutating,setMutating]=useState(false);
  const previews=uploads.filter(x=>x.kind==='preview'), sourceFiles=uploads.filter(x=>x.kind==='file');
  const suggestions=useMemo(()=>[data.buildingType,data.style,data.width&&data.length?`${data.width}x${data.length}m`:'',data.floors?`${data.floors} tầng`:'',...data.formats.map(x=>`file ${x.toLowerCase()}`),...data.disciplines].filter(Boolean).map(x=>String(x).toLowerCase()).filter((x,i,a)=>a.indexOf(x)===i&&!data.keywords.includes(x)).slice(0,8),[data]);
  function set(name:keyof FormDataShape,value:any){setData(prev=>({...prev,[name]:value}))}
  function toggle(name:'formats'|'disciplines'|'tools',value:string){set(name,data[name].includes(value)?data[name].filter(x=>x!==value):[...data[name],value])}
  function field(e:ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>){set(e.target.name as keyof FormDataShape,e.target.value)}
  function validate(target=step){
    if(target===0){if(!data.title.trim())return 'Vui lòng nhập tên hồ sơ.';if(data.title.length>160)return 'Tên hồ sơ tối đa 160 ký tự.';if(data.shortDescription.length>300)return 'Mô tả ngắn tối đa 300 ký tự.'}
    if(target===2&&!previews.some(x=>!x.error&&!x.id.startsWith('temp-')))return 'Cần ít nhất một ảnh preview.';
    if(target===3&&!sourceFiles.filter(x=>!x.error&&!x.id.startsWith('temp-')).length)return 'Cần ít nhất một file hồ sơ.';
    if(target===4&&!data.isFree&&Number(data.price)<=0)return 'Vui lòng nhập giá bán lớn hơn 0đ.';
    return '';
  }
  async function saveDraft(){setBusy(true);setError('');setMessage('');try{const response=await fetch('/api/marketplace/products',{method:productId?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,...(productId?{id:productId}:{}),width:data.width?Number(data.width):null,length:data.length?Number(data.length):null,floors:data.floors?Number(data.floors):null,area:data.area?Number(data.area):null,price:Number(data.price||0)})});const result:any=await response.json();if(!response.ok)throw new Error(result.error||'Không thể lưu bản nháp.');setProductId(result.id);setMessage('Đã lưu bản nháp.');return true}catch(e){setError(e instanceof Error?e.message:'Không thể lưu bản nháp.');return false}finally{setBusy(false)}}
  async function next(){if(transferring||mutating||busy)return;const issue=validate();if(issue){setError(issue);return}if((step===0||step===1||step===4)&&!await saveDraft())return;setError('');setStep(Math.min(5,step+1))}
  async function uploadFiles(files:FileList|File[],kind:'preview'|'file'){
    if(transferLock.current||mutationLock.current)return;
    if(!productId){setError('Hãy lưu thông tin sản phẩm trước khi tải file.');return}
    const selected=Array.from(files);
    if(kind==='preview'&&previews.filter(x=>!x.error).length+selected.length>20){setError('Mỗi hồ sơ hỗ trợ tối đa 20 ảnh.');return}
    transferLock.current=true;setTransferring(true);setError('');setMessage('');
    try {
      for(const file of selected){
        const temp=`temp-${crypto.randomUUID()}`;
        setUploads(v=>[...v,{id:temp,name:file.name,size:file.size,progress:0,kind}]);
        try {
          const uploadFile=kind==='preview'?await optimizeImageToWebp(file,{maxDimension:2400,maxBytes:4*1024*1024}):file;
          setUploads(v=>v.map(x=>x.id===temp?{...x,name:uploadFile.name,size:uploadFile.size,progress:2}:x));
          const result=await uploadProductFile(productId,uploadFile,kind,progress=>setUploads(v=>v.map(x=>x.id===temp?{...x,progress}:x)));
          const extension=uploadFile.name.split('.').pop()?.toUpperCase()||'';
          setUploads(v=>v.map(x=>x.id===temp?{...x,id:result.id,url:result.url,extension,progress:100}:x));
          if(kind==='preview')setCoverId(current=>current||result.id);
          if(kind==='file'&&formats.includes(extension))setData(current=>({...current,formats:[...new Set([...current.formats,extension])]}));
        }catch(error){
          setUploads(v=>v.map(x=>x.id===temp?{...x,error:true}:x));
          setError(error instanceof Error?error.message:'Tải file thất bại.');
        }
      }
    }finally{transferLock.current=false;setTransferring(false)}
  }
  function drop(e:DragEvent<HTMLDivElement>,kind:'preview'|'file'){e.preventDefault();void uploadFiles(e.dataTransfer.files,kind)}
  async function remove(item:UploadItem){
    if(transferLock.current||mutationLock.current)return;
    mutationLock.current=true;setMutating(true);setError('');
    try {
      if(!item.id.startsWith('temp-')){
        const response=await fetch('/api/marketplace/assets',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.id,kind:item.kind})});
        const result=await response.json() as {error?:string};
        if(!response.ok)throw new Error(result.error||'Không thể xóa file.');
      }
      setUploads(v=>v.filter(x=>x.id!==item.id));
      if(coverId===item.id)setCoverId(null);
      setMessage('Đã xóa file khỏi hồ sơ.');
    }catch(error){setError(error instanceof Error?error.message:'Không thể xóa file.')}
    finally{mutationLock.current=false;setMutating(false)}
  }
  async function persistOrder(next:UploadItem[],newCover=coverId){
    if(!productId||transferLock.current||mutationLock.current)return false;
    mutationLock.current=true;setMutating(true);setError('');
    const ready=next.filter(x=>!x.error&&!x.id.startsWith('temp-'));
    try{
      const response=await fetch('/api/marketplace/assets',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId,ids:ready.map(x=>x.id),coverId:newCover||undefined})});
      const result=await response.json() as {error?:string};
      if(!response.ok)throw new Error(result.error||'Không thể lưu thứ tự ảnh.');
      setUploads(current=>[...next,...current.filter(x=>x.kind==='file')]);setCoverId(newCover);
      setMessage('Đã lưu thứ tự ảnh và ảnh bìa.');return true;
    }catch(error){setError(error instanceof Error?error.message:'Không thể lưu thứ tự ảnh.');return false}
    finally{mutationLock.current=false;setMutating(false)}
  }
  function reorder(from:string,to:string){if(from===to)return;const next=[...previews],a=next.findIndex(x=>x.id===from),b=next.findIndex(x=>x.id===to);if(a<0||b<0)return;const[m]=next.splice(a,1);next.splice(b,0,m);void persistOrder(next)}
  async function makeCover(id:string){await persistOrder(previews,id)}
  function addKeyword(value=keywordInput){const key=value.trim().toLowerCase().replace(/^,+|,+$/g,'');if(key.length<2||data.keywords.includes(key)||data.keywords.length>=8)return;set('keywords',[...data.keywords,key]);setKeywordInput('')}
  function keywordKey(e:KeyboardEvent<HTMLInputElement>){if(e.key==='Enter'||e.key===','){e.preventDefault();addKeyword()}}
  async function submit(){if(transferring||mutating||busy)return;for(let i=0;i<5;i++){const issue=validate(i);if(issue){setStep(i);setError(issue);return}}if(!productId||!await saveDraft())return;setBusy(true);setError('');try{const response=await fetch(`/api/marketplace/products/${productId}/submit`,{method:'POST'}),result:any=await response.json();if(!response.ok)throw new Error(result.error||'Không thể gửi duyệt.');router.push('/dashboard/san-pham')}catch(error){setError(error instanceof Error?error.message:'Không thể gửi duyệt.')}finally{setBusy(false)}}

  const areaSuggestion=data.width&&data.length?Math.round(Number(data.width)*Number(data.length)*100)/100:0;
  const stepHelp=['Nhập những thông tin cơ bản để người mua nhận biết hồ sơ.','Bổ sung thông số nếu có; các trường ở bước này đều có thể để trống.','Tải ảnh xem trước, chọn ảnh bìa và sắp xếp theo thứ tự mong muốn.','Tải ít nhất một file nguồn để bàn giao cho người mua.','Chọn hình thức miễn phí hoặc trả phí và thêm từ khóa nếu cần.','Kiểm tra cách hồ sơ hiển thị trước khi gửi quản trị viên duyệt.'];
  if(loadState==='loading')return <div className="content-card" role="status">Đang tải bản nháp…</div>;
  if(loadState==='error')return <div className="content-card"><p className="form-error" role="alert">{error}</p><button type="button" className="outline-action" onClick={()=>window.location.reload()}>Tải lại bản nháp</button></div>;
  return <div className="wizard"><ol className="wizard-steps">{steps.map((name,i)=><li className={i===step?'active':i<step?'done':''} key={name}><span>{i<step?<Check size={14}/>:String(i+1).padStart(2,'0')}</span>{name}</li>)}</ol><form onSubmit={(e:FormEvent)=>{e.preventDefault();void next()}}><section className="wizard-panel"><header className="wizard-step-copy"><span>BƯỚC {String(step+1).padStart(2,'0')}</span><h2>{steps[step]}</h2><p>{stepHelp[step]}</p></header>
    {step===0&&<div className="form-grid"><label className="wide">Tên hồ sơ <small>{data.title.length}/160 · Bắt buộc</small><input name="title" value={data.title} onChange={field} maxLength={160} placeholder="Ví dụ: Hồ sơ nhà phố 5x20m hiện đại 3 tầng"/></label><label>Loại công trình<select name="category" value={data.category} onChange={e=>{field(e);set('buildingType',e.target.value)}}>{buildings.map(x=><option key={x}>{x}</option>)}</select></label><label>Phong cách <small>Không bắt buộc</small><select name="style" value={data.style} onChange={field}>{styles.map(x=><option key={x}>{x}</option>)}</select></label><label className="wide">Mô tả ngắn <small>{data.shortDescription.length}/300 · Không bắt buộc</small><textarea name="shortDescription" value={data.shortDescription} onChange={field} maxLength={300} rows={3} placeholder="Tóm tắt điểm nổi bật của hồ sơ…"/></label><label className="wide">Mô tả chi tiết <small>Không bắt buộc</small><RichTextEditor value={data.description} onChange={v=>set('description',v)}/></label></div>}
    {step===1&&<><div className="form-grid"><label>Chiều rộng (m)<input name="width" type="number" step="0.1" value={data.width} onChange={field}/></label><label>Chiều dài (m)<input name="length" type="number" step="0.1" value={data.length} onChange={field}/></label><label>Số tầng<input name="floors" type="number" min="1" value={data.floors} onChange={field}/></label><label>Diện tích (m²)<input name="area" type="number" step="0.1" value={data.area} onChange={field}/>{areaSuggestion>0&&Number(data.area)!==areaSuggestion&&<button type="button" className="area-suggestion" onClick={()=>set('area',String(areaSuggestion))}>Dùng {areaSuggestion} m²</button>}</label></div><OptionGroup title="Hạng mục hồ sơ" values={disciplines} selected={data.disciplines} onToggle={v=>toggle('disciplines',v)}/><OptionGroup title="Công cụ sử dụng" values={tools} selected={data.tools} onToggle={v=>toggle('tools',v)}/><OptionGroup title="Định dạng bàn giao" values={formats} selected={data.formats} onToggle={v=>toggle('formats',v)}/></>}
    {step===2&&<UploadStep
      disabled={transferring||mutating} kind="preview" items={previews} coverId={coverId}
      onFiles={f=>uploadFiles(f,'preview')} onDrop={e=>drop(e,'preview')}
      onRemove={remove} onReorder={reorder} onCover={makeCover}
    />}
    {step===3&&<UploadStep
      disabled={transferring||mutating} kind="file" items={sourceFiles}
      onFiles={f=>uploadFiles(f,'file')} onDrop={e=>drop(e,'file')} onRemove={remove}
    />}
    {step===4&&<div className="seo-step"><div className="price-options"><h3>Hình thức đăng</h3><div className="price-choice"><button type="button" aria-pressed={data.isFree} className={data.isFree?'selected':''} onClick={()=>{set('isFree',true);set('price','0')}}><span>Miễn phí</span><small>Người dùng có thể tải hồ sơ sau khi đăng nhập.</small></button><button type="button" aria-pressed={!data.isFree} className={!data.isFree?'selected':''} onClick={()=>{set('isFree',false);if(data.price==='0')set('price','')}}><span>Trả phí</span><small>Hiển thị giá bán; thanh toán sẽ mở ở phiên bản tiếp theo.</small></button></div>{!data.isFree&&<label>Giá bán (VNĐ)<div className="currency-input"><input name="price" inputMode="numeric" value={data.price?Number(data.price).toLocaleString('vi-VN'):''} onChange={e=>set('price',e.target.value.replace(/\D/g,'').replace(/^0+(?=\d)/,''))} placeholder="129.000"/><span>VNĐ</span></div><small>Nhập số lớn hơn 0. Ví dụ: 129.000</small></label>}</div><div className="keyword-editor"><h3>Từ khóa tìm kiếm <small>{data.keywords.length}/8 · Không bắt buộc</small></h3><div className="keyword-tags">{data.keywords.map(x=><span key={x}>{x}<button type="button" onClick={()=>set('keywords',data.keywords.filter(k=>k!==x))} aria-label={`Xóa ${x}`}><X/></button></span>)}</div><input value={keywordInput} onChange={e=>setKeywordInput(e.target.value)} onKeyDown={keywordKey} onBlur={()=>addKeyword()} placeholder="Nhập từ khóa rồi nhấn Enter"/><div className="keyword-suggestions"><small>Gợi ý:</small>{suggestions.map(x=><button type="button" key={x} onClick={()=>addKeyword(x)}>+ {x}</button>)}</div></div></div>}
    {step===5&&<div className="wizard-preview"><section><h2>Thẻ sản phẩm</h2><ProductCard preview product={{...data,image:(previews.find(x=>x.id===coverId)||previews.find(x=>x.url))?.url,is_free:data.isFree,price:Number(data.price),floors:Number(data.floors)||null,seller_name:'Hồ sơ của bạn'}}/></section><section className="wizard-detail-preview"><h2>Khung trang chi tiết</h2><div className="detail-preview-frame"><ProductGallery images={previews.filter(x=>x.url&&!x.error).map((x,i)=>({id:x.id,src:x.url!,alt:`${data.title} - ảnh ${i+1}`}))} compact/><div><h3>{data.title}</h3>{data.shortDescription&&<p>{data.shortDescription}</p>}<strong>{data.isFree?'MIỄN PHÍ':`${Number(data.price).toLocaleString('vi-VN')}đ`}</strong></div></div></section></div>}
    {error&&<p className="form-error" role="alert">{error}</p>}{message&&<p className="form-success" role="status">{message}</p>}
  </section><footer className="wizard-actions">{step>0&&<button type="button" className="outline-action" onClick={()=>{setError('');setStep(step-1)}}><ChevronLeft size={16}/>{step===5?'Quay lại chỉnh sửa':'Quay lại'}</button>}<button type="button" className="outline-action" disabled={busy||transferring||mutating} onClick={()=>void saveDraft()}>Lưu bản nháp</button>{step<5?<button className="form-submit" disabled={busy||transferring||mutating}>Tiếp tục<ChevronRight size={16}/></button>:<button type="button" className="form-submit" disabled={busy||transferring||mutating} onClick={()=>void submit()}>Gửi duyệt</button>}</footer></form></div>;
}

function OptionGroup({title,values,selected,onToggle}:{title:string;values:string[];selected:string[];onToggle:(v:string)=>void}){return <fieldset className="option-group"><legend>{title}</legend>{values.map(x=><label key={x}><input type="checkbox" checked={selected.includes(x)} onChange={()=>onToggle(x)}/>{x}</label>)}</fieldset>}
function UploadStep({disabled,kind,items,coverId,onFiles,onDrop,onRemove,onReorder,onCover}:{disabled:boolean;kind:'preview'|'file';items:UploadItem[];coverId?:string|null;onFiles:(f:FileList)=>void;onDrop:(e:DragEvent<HTMLDivElement>)=>void;onRemove:(i:UploadItem)=>void;onReorder?:(from:string,to:string)=>void;onCover?:(id:string)=>void}){
  const input=useRef<HTMLInputElement>(null),opener=useRef<HTMLElement|null>(null);
  const [view,setView]=useState<number|null>(null);
  const ready=items.filter(item=>item.url&&!item.error&&!item.id.startsWith('temp-'));
  const cover=ready.find(item=>item.id===coverId)||ready[0];
  function show(id:string){opener.current=document.activeElement as HTMLElement;setView(ready.findIndex(item=>item.id===id))}
  return <div className={kind==='preview'?'media-manager':'file-manager'} aria-busy={disabled}>
    {kind==='preview'&&cover&&<section className="cover-preview"><SafeImage src={cover.url!} alt="Ảnh bìa hiện tại"/><div><span>ẢNH BÌA HIỆN TẠI</span><b>{cover.name}</b><button className="outline-action" type="button" onClick={()=>show(cover.id)}><Eye size={16}/>Xem ảnh lớn</button><small>Chọn biểu tượng ngôi sao bên dưới để đổi ảnh bìa.</small></div></section>}
    <div className="drop-zone" onDragOver={e=>e.preventDefault()} onDrop={e=>{if(disabled)e.preventDefault();else onDrop(e)}}>
      {kind==='preview'?<ImagePlus/>:<UploadCloud/>}<b>{kind==='preview'?'Kéo ảnh vào đây hoặc chọn ảnh':'Kéo file vào đây hoặc chọn file'}</b>
      <span>{kind==='preview'?'JPG, PNG, WEBP · tự động nén và chuyển sang WEBP':'DWG, SKP, RVT, PDF, XLSX, DOCX, ZIP, RAR · 250MB/file · File nguồn riêng tư'}</span>
      <input ref={input} hidden type="file" disabled={disabled} multiple accept={kind==='preview'?'.jpg,.jpeg,.png,.webp':'.dwg,.skp,.rvt,.pdf,.xlsx,.docx,.zip,.rar'} onChange={e=>{if(e.target.files)onFiles(e.target.files);e.target.value=''}}/>
      <button type="button" className="outline-action" disabled={disabled} onClick={()=>input.current?.click()}>{disabled?'Đang xử lý…':kind==='preview'?'Chọn ảnh':'Chọn file'}</button>
    </div>
    {kind==='preview'&&items.length>1&&<p className="media-help">Kéo để sắp xếp, hoặc dùng nút ảnh trước / ảnh sau bên dưới mỗi ảnh.</p>}
    <div className={kind==='preview'?'media-grid':'upload-list'}>{items.map((item,index)=>{
      const pending=item.id.startsWith('temp-'),locked=disabled||pending;
      return <article className={`${item.error?'upload-error':''}${coverId===item.id?' is-cover':''}`} key={item.id} draggable={kind==='preview'&&!locked}
        onDragStart={e=>e.dataTransfer.setData('text/plain',item.id)} onDragOver={e=>kind==='preview'&&e.preventDefault()}
        onDrop={e=>{if(kind==='preview'){e.preventDefault();if(!disabled)onReorder?.(e.dataTransfer.getData('text/plain'),item.id)}}}>
        {kind==='preview'?<div className="media-thumb">{item.url&&<SafeImage src={item.url} alt={`Ảnh ${index+1}`}/>}<span className="media-index"><GripVertical size={14}/>{index+1}</span>{coverId===item.id&&<b className="cover-badge">ẢNH BÌA</b>}</div>:<><span className="file-order">{index+1}</span><span className="file-extension">{item.extension||item.name.split('.').pop()?.toUpperCase()}</span></>}
        <span className="upload-info"><b>{item.name}</b><small>{item.error?'Tải lên thất bại — chọn lại file để thử lại':pending?`Đang tải ${item.progress}%`:item.size?`${(item.size/1024/1024).toFixed(2)} MB · Đã tải lên`:'Đã tải lên'}</small>{pending&&!item.error&&<i role="progressbar" aria-label={`Tải ${item.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.progress}><em style={{width:`${item.progress}%`}}/></i>}</span>
        <div className="upload-actions">
          {kind==='preview'&&<><button type="button" disabled={locked} onClick={()=>show(item.id)} aria-label={`Xem ảnh ${index+1}`}><Eye/></button><button type="button" disabled={locked} className="cover-action" onClick={()=>onCover?.(item.id)} aria-label={`Đặt ảnh ${index+1} làm bìa`} aria-pressed={coverId===item.id}><Star fill={coverId===item.id?'currentColor':'none'}/></button><button type="button" disabled={locked||index===0} onClick={()=>onReorder?.(item.id,items[index-1].id)} aria-label={`Chuyển ảnh ${index+1} về trước`}><ChevronLeft/></button><button type="button" disabled={locked||index===items.length-1} onClick={()=>onReorder?.(item.id,items[index+1].id)} aria-label={`Chuyển ảnh ${index+1} về sau`}><ChevronRight/></button></>}
          {kind==='file'&&!pending&&<a href={`/api/download/${item.id}`} aria-label={`Tải ${item.name}`}><Download/></a>}
          <button type="button" disabled={disabled} onClick={()=>onRemove(item)} aria-label={`Xóa ${item.name}`}><Trash2/></button>
        </div>
      </article>;
    })}</div>
    {view!==null&&ready.length>0&&<ImageViewer images={ready.map(item=>({id:item.id,src:item.url!,alt:item.name}))} initial={view} onIndex={setView} onClose={()=>{setView(null);opener.current?.focus()}}/>}
  </div>;
}
