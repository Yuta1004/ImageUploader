interface Album {
    id: string,
    name: string,
    writable: boolean,
    removable: boolean,
    last_updated_at: string,
    items_count: number,
    files: string[]
}

export default Album;
