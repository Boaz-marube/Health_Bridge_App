export const formatPatientName = (name: string): string => {
  if (!name) return 'Patient'
  
  // Extract clean name (remove numbers, special characters)
  const cleanName = name.split(/[0-9@._-]/)[0]
  
  // Capitalize first letter, lowercase rest
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase()
}

export const formatDoctorName = (name: string): string => {
  if (!name) return 'Doctor'
  
  // If name already starts with Dr., return as is
  if (name.startsWith('Dr.')) {
    return name
  }
  
  // Extract first name and add Dr. prefix
  const firstName = name.split(/[0-9@._-]/)[0]
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
  return `Dr. ${capitalizedName}`
}