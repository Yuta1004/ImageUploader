interface Album {
    id: string,
    name: string,
    writable: boolean,
    removable: boolean,
    last_update: string,
    files: string[]
}

export default Album;
