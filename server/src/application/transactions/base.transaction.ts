export interface Transaction {}

export interface TransactionManager {
	transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>;
}
