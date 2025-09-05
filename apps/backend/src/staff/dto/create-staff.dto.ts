export class CreateStaffDto {
  userId: string;
  employeeId: string;
  role: string;
  department: string;
  shift: string;
  permissions?: string[];
}

export class UpdateStaffDto {
  userId?: string;
  employeeId?: string;
  role?: string;
  department?: string;
  shift?: string;
  permissions?: string[];
  isActive?: boolean;
}