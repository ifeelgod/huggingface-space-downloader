export interface HfFile {
  rfilename: string;
  size: number;
  lastModified: string;
}

export interface HfSpaceData {
  id: string;
  siblings: HfFile[];
  private: boolean;
  author: string;
  lastModified: string;
}
