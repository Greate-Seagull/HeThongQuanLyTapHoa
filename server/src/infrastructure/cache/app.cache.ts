import { Cache } from "./cache";

export class AppCache<K, V> implements Cache {
    private table = new Map<K, V>
}