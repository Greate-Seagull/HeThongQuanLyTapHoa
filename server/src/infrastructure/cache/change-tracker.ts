export class ChangeTracker<record> {
	private snapshots = new Map<any, record>();

	track(id: any, snapshot: record) {
		this.snapshots.set(id, structuredClone(snapshot));
	}

	diff(id: any, current: record): Partial<record> {
		const original = this.snapshots.get(id);
		if (!original) return current as Partial<record>;

		const changes: Partial<record> = {};
		for (const key in current) {
			if (current[key] !== original[key]) changes[key] = current[key];
		}

		return changes;
	}

	detach(id: any) {
		this.snapshots.delete(id);
	}
}
