export interface IJEView {
    type: IJEViewType;
    selectionId?: number;
    selectionFolder?: string;
}
export enum IJEViewType {
    TABLE = 'table',
    LIST = 'list'
}