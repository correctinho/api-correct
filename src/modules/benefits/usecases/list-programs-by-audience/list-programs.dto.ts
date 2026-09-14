export interface OutputListProgramsDto {
  programs: {
    uuid: string;
    name: string;
    description: string | null;
    img_url: string | null;
  }[];
}
