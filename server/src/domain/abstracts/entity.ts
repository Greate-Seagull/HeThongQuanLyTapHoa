export interface Entity<IdType, PropsType> {
	get id(): IdType;
	get props(): PropsType;
}
