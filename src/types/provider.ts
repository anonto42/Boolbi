

export type offer = {
    jobID: string;
    companyName: string;
    projectName: string;
    catagory: string;
    budget: number;
    description: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}