'use client';

import { useEffect, useRef } from 'react';
import { Bold, Heading2, Italic, List, ListOrdered, Pilcrow } from 'lucide-react';

export function RichTextEditor({value,onChange}:{value:string;onChange:(value:string)=>void}){
  const editor=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(editor.current&&editor.current.innerHTML!==value)editor.current.innerHTML=value},[value]);
  function command(name:string,arg?:string){editor.current?.focus();document.execCommand(name,false,arg);onChange(editor.current?.innerHTML||'')}
  return <div className="rich-editor"><div className="rich-toolbar" aria-label="Định dạng mô tả">
    <button type="button" onClick={()=>command('formatBlock','p')} title="Đoạn văn"><Pilcrow/></button><button type="button" onClick={()=>command('formatBlock','h2')} title="Tiêu đề"><Heading2/></button><button type="button" onClick={()=>command('bold')} title="In đậm"><Bold/></button><button type="button" onClick={()=>command('italic')} title="In nghiêng"><Italic/></button><button type="button" onClick={()=>command('insertUnorderedList')} title="Danh sách"><List/></button><button type="button" onClick={()=>command('insertOrderedList')} title="Danh sách số"><ListOrdered/></button>
  </div><div ref={editor} className="rich-content" contentEditable role="textbox" aria-multiline="true" data-placeholder="Mô tả thành phần hồ sơ, tiêu chuẩn thiết kế và phạm vi sử dụng…" suppressContentEditableWarning onInput={e=>onChange(e.currentTarget.innerHTML)}/></div>;
}
