'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProjects, mockUsers } from '@/lib/mock-data';
import {
  UploadCloud, File, Folder, MoreVertical, Download, Image as ImageIcon,
  Video, FileText, Plus, X, Search, Grid, List, FolderOpen, Check,
  Trash2, Eye, Copy, Share2,
} from 'lucide-react';

const FOLDERS = ['01_Raw_Footage', '02_Audio', '03_Project_Files', '04_Exports', '05_Client_Review'];

interface VaultFile {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  size: string;
  version: string;
  folder: string;
  uploadedAt: string;
  type: 'video' | 'image' | 'document' | 'audio';
}

const INITIAL_FILES: VaultFile[] = [
  { id: 'f1', name: 'Montax_Hero_v1.mp4', icon: Video, color: '#3b82f6', size: '1.2 GB', version: 'v1', folder: '04_Exports', uploadedAt: '2 days ago', type: 'video' },
  { id: 'f2', name: 'Montax_Hero_v2_FINAL.mp4', icon: Video, color: '#10b981', size: '1.2 GB', version: 'v2', folder: '04_Exports', uploadedAt: '1 day ago', type: 'video' },
  { id: 'f3', name: 'Typography_Spec.pdf', icon: FileText, color: '#f59e0b', size: '4.2 MB', version: 'v4', folder: '04_Exports', uploadedAt: '3 days ago', type: 'document' },
  { id: 'f4', name: 'Logo_Lockup_Dark.png', icon: ImageIcon, color: '#8b5cf6', size: '2.1 MB', version: 'v1', folder: '04_Exports', uploadedAt: '4 days ago', type: 'image' },
  { id: 'f5', name: 'BFB_Raw_Day1.mp4', icon: Video, color: '#b6332e', size: '4.5 GB', version: 'v1', folder: '01_Raw_Footage', uploadedAt: '5 days ago', type: 'video' },
  { id: 'f6', name: 'Voice_Over_Track.wav', icon: File, color: '#f59e0b', size: '28 MB', version: 'v1', folder: '02_Audio', uploadedAt: '2 days ago', type: 'audio' },
  { id: 'f7', name: 'Premiere_Project.prproj', icon: FileText, color: '#8b5cf6', size: '512 MB', version: 'v3', folder: '03_Project_Files', uploadedAt: '1 day ago', type: 'document' },
  { id: 'f8', name: 'Client_Stills_R1.zip', icon: ImageIcon, color: '#10b981', size: '320 MB', version: 'v1', folder: '05_Client_Review', uploadedAt: 'Today', type: 'image' },
];

function generateId() { return `file_${Date.now().toString(36)}`; }

export default function ProjectVault() {
  const [files, setFiles] = useState<VaultFile[]>(INITIAL_FILES);
  const [activeFolder, setActiveFolder] = useState('04_Exports');
  const [activeProject, setActiveProject] = useState(mockProjects[0].id);
  const [dragActive, setDragActive] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [contextFile, setContextFile] = useState<VaultFile | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', version: 'v1', folder: '04_Exports' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const project = mockProjects.find(p => p.id === activeProject) ?? mockProjects[0];
  const folderFiles = files.filter(f => f.folder === activeFolder && (search === '' || f.name.toLowerCase().includes(search.toLowerCase())));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) addFiles(droppedFiles);
  };

  const addFiles = (rawFiles: File[]) => {
    const newFiles: VaultFile[] = rawFiles.map(f => {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      const isVideo = ['mp4', 'mov', 'avi', 'mkv'].includes(ext);
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
      const isAudio = ['mp3', 'wav', 'aac', 'm4a'].includes(ext);
      return {
        id: generateId(), name: f.name,
        icon: isVideo ? Video : isImage ? ImageIcon : isAudio ? File : FileText,
        color: isVideo ? '#3b82f6' : isImage ? '#10b981' : isAudio ? '#f59e0b' : '#888',
        size: `${(f.size / 1024 / 1024).toFixed(1)} MB`, version: 'v1',
        folder: activeFolder, uploadedAt: 'Just now',
        type: isVideo ? 'video' : isImage ? 'image' : isAudio ? 'audio' : 'document',
      };
    });
    setFiles(prev => [...newFiles, ...prev]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(Array.from(e.target.files));
  };

  const deleteFile = (id: string) => { setFiles(prev => prev.filter(f => f.id !== id)); setContextFile(null); };

  const handleModalUpload = () => {
    if (!uploadForm.name.trim()) return;
    const ext = uploadForm.name.split('.').pop()?.toLowerCase() ?? '';
    const isVideo = ['mp4', 'mov', 'avi'].includes(ext);
    const newFile: VaultFile = {
      id: generateId(), name: uploadForm.name, icon: isVideo ? Video : FileText,
      color: isVideo ? '#3b82f6' : '#888', size: '—', version: uploadForm.version,
      folder: uploadForm.folder, uploadedAt: 'Just now', type: isVideo ? 'video' : 'document',
    };
    setFiles(prev => [newFile, ...prev]);
    setActiveFolder(uploadForm.folder);
    setShowUploadModal(false);
    setUploadForm({ name: '', version: 'v1', folder: '04_Exports' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#eee]">Project Vault</h1>
          <p className="text-xs text-[#555] mt-0.5">{project.name} · Asset management &amp; versioning</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary text-xs">
            <Plus className="w-3.5 h-3.5" /> Quick Upload
          </button>
          <button onClick={() => setShowUploadModal(true)} className="btn-primary text-xs">
            <UploadCloud className="w-3.5 h-3.5" /> Upload Asset
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInput} />
        </div>
      </div>

      {/* Project tabs */}
      <div className="flex gap-1 mb-4 flex-shrink-0">
        {mockProjects.slice(0, 4).map(p => (
          <button key={p.id} onClick={() => setActiveProject(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all truncate max-w-[150px] border ${activeProject === p.id ? 'border-[rgba(182,51,46,0.3)] bg-[rgba(182,51,46,0.1)] text-[#b6332e]' : 'border-[rgba(255,255,255,0.06)] text-[#555] hover:text-[#888]'}`}>
            {p.name}
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Folder Sidebar */}
        <div className="glass-panel rounded-2xl p-4 overflow-y-auto hidden lg:flex flex-col gap-1">
          <p className="section-label mb-3">Folders</p>
          {FOLDERS.map(folder => (
            <button key={folder} onClick={() => setActiveFolder(folder)}
              className={`flex items-center gap-2.5 p-2 rounded-lg text-xs transition-all text-left w-full ${activeFolder === folder ? 'bg-[rgba(182,51,46,0.1)] text-[#b6332e] font-bold' : 'text-[#888] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#eee]'}`}>
              {activeFolder === folder ? <FolderOpen className="w-4 h-4 fill-current opacity-80" /> : <Folder className="w-4 h-4 opacity-60" />}
              <span className="truncate font-mono text-[11px]">{folder}</span>
              <span className="ml-auto text-[9px] text-[#444]">{files.filter(f => f.folder === folder).length}</span>
            </button>
          ))}
        </div>

        {/* Main Area */}
        <div
          className={`lg:col-span-3 glass-panel rounded-2xl flex flex-col overflow-hidden transition-colors ${dragActive ? 'border-[#b6332e] bg-[rgba(182,51,46,0.02)]' : ''}`}
          onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
        >
          {dragActive && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm border-2 border-dashed border-[#b6332e] rounded-2xl">
              <div className="text-center">
                <UploadCloud className="w-12 h-12 text-[#b6332e] mx-auto mb-3 animate-bounce" />
                <p className="text-lg font-bold text-white">Drop to Upload</p>
                <p className="text-xs text-[#888] mt-1">Files versioned automatically</p>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between bg-[#0a0a0a] flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <p className="font-mono text-xs text-[#eee] truncate">/ {activeFolder}</p>
              <span className="text-[10px] text-[#555]">{folderFiles.length} files</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#444]" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." className="os-input pl-8 text-xs py-1.5 w-36" />
              </div>
              <button onClick={() => setViewMode('grid')} className={`w-7 h-7 flex items-center justify-center rounded ${viewMode === 'grid' ? 'bg-[rgba(255,255,255,0.08)]' : 'hover:bg-[rgba(255,255,255,0.04)]'}`}>
                <Grid className="w-3.5 h-3.5 text-[#555]" />
              </button>
              <button onClick={() => setViewMode('list')} className={`w-7 h-7 flex items-center justify-center rounded ${viewMode === 'list' ? 'bg-[rgba(255,255,255,0.08)]' : 'hover:bg-[rgba(255,255,255,0.04)]'}`}>
                <List className="w-3.5 h-3.5 text-[#555]" />
              </button>
            </div>
          </div>

          {/* Files */}
          <div className="flex-1 overflow-y-auto p-4">
            {folderFiles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <FolderOpen className="w-10 h-10 text-[#1a1a1a] mb-3" />
                <p className="text-sm font-bold text-[#333]">No files here</p>
                <p className="text-xs text-[#444] mt-1">Drag & drop or click Upload Asset</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {folderFiles.map((file, i) => (
                  <motion.div key={file.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                    className="glass-panel-elevated rounded-xl p-3 group cursor-pointer hover:bg-[rgba(255,255,255,0.03)] relative transition-colors"
                    onClick={() => setContextFile(contextFile?.id === file.id ? null : file)}>
                    <div className="aspect-square bg-[#050505] rounded-lg mb-2.5 flex items-center justify-center relative border border-[rgba(255,255,255,0.04)]">
                      <file.icon className="w-10 h-10 opacity-40" style={{ color: file.color }} />
                      <span className="absolute top-1.5 right-1.5 text-[8px] font-bold bg-[#111] border border-[rgba(255,255,255,0.08)] px-1 py-0.5 rounded text-[#aaa]">{file.version}</span>
                    </div>
                    <p className="text-[10px] font-bold text-[#eee] truncate pr-5" title={file.name}>{file.name}</p>
                    <p className="text-[9px] text-[#555] mt-0.5">{file.size} · {file.uploadedAt}</p>
                    <button onClick={e => { e.stopPropagation(); setContextFile(contextFile?.id === file.id ? null : file); }}
                      className="absolute bottom-3 right-2.5 text-[#333] hover:text-[#eee] opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                    <AnimatePresence>
                      {contextFile?.id === file.id && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                          className="absolute bottom-full right-0 mb-1 z-20 glass-panel-elevated rounded-xl border border-[rgba(255,255,255,0.1)] py-1 min-w-[130px] shadow-xl">
                          {[
                            { label: 'Preview', icon: Eye, action: () => { } },
                            { label: 'Download', icon: Download, action: () => { } },
                            { label: 'Copy Link', icon: Copy, action: () => { } },
                            { label: 'Share', icon: Share2, action: () => { } },
                            { label: 'Delete', icon: Trash2, action: () => deleteFile(file.id) },
                          ].map(item => (
                            <button key={item.label} onClick={e => { e.stopPropagation(); item.action(); setContextFile(null); }}
                              className={`flex items-center gap-2.5 w-full px-3 py-2 text-[11px] ${item.label === 'Delete' ? 'text-[#b6332e] hover:bg-[rgba(182,51,46,0.08)]' : 'text-[#888] hover:text-[#eee] hover:bg-[rgba(255,255,255,0.04)]'} transition-colors`}>
                              <item.icon className="w-3 h-3" /> {item.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {folderFiles.map((file, i) => (
                  <motion.div key={file.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.03)] group transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-[#111] flex items-center justify-center flex-shrink-0">
                      <file.icon className="w-4 h-4 opacity-60" style={{ color: file.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#eee] truncate">{file.name}</p>
                    </div>
                    <span className="text-[9px] font-bold text-[#444] w-6">{file.version}</span>
                    <span className="text-[10px] text-[#555] w-20 text-right">{file.size}</span>
                    <span className="text-[10px] text-[#444] w-20 text-right hidden md:block">{file.uploadedAt}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-[#555] hover:text-[#eee]"><Download className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteFile(file.id)} className="p-1 text-[#555] hover:text-[#b6332e]"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass-panel-elevated rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#eee]">Upload Asset</h2>
                <button onClick={() => setShowUploadModal(false)}><X className="w-4 h-4 text-[#444] hover:text-white" /></button>
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[rgba(255,255,255,0.1)] rounded-xl p-8 text-center cursor-pointer hover:border-[rgba(182,51,46,0.4)] hover:bg-[rgba(182,51,46,0.02)] transition-colors">
                <UploadCloud className="w-8 h-8 text-[#333] mx-auto mb-2" />
                <p className="text-sm text-[#555]">Click or drag files here</p>
                <p className="text-[10px] text-[#444] mt-1">Any file type · Max 5GB</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="section-label mb-1.5 block">File Name (if adding manually)</label>
                  <input type="text" className="os-input" value={uploadForm.name} onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. hero_v3.mp4" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="section-label mb-1.5 block">Version</label>
                    <input type="text" className="os-input" value={uploadForm.version} onChange={e => setUploadForm(f => ({ ...f, version: e.target.value }))} />
                  </div>
                  <div>
                    <label className="section-label mb-1.5 block">Folder</label>
                    <select className="os-input cursor-pointer" value={uploadForm.folder} onChange={e => setUploadForm(f => ({ ...f, folder: e.target.value }))}>
                      {FOLDERS.map(fl => <option key={fl} value={fl}>{fl}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowUploadModal(false)} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button onClick={handleModalUpload} disabled={!uploadForm.name.trim()} className="btn-primary flex-1 justify-center text-xs disabled:opacity-40">
                  <UploadCloud className="w-3.5 h-3.5" /> Upload
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
