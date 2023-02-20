interface Album {
    // 基本情報
    id: string,
    name: string,
    writable: boolean,
    removable: boolean,
    last_updated_at: string,
    items_count: number,

    // アイテム
    images: string[],                   // name
    youtube_movies: [string, string][]  // name, id
}

export default Album;
