// utils/fileNameValidator.ts

export function isValidProjectName(name: string): {isValid: boolean; message: string} {
  return (isValidFileName(name)); //reuse the function from filename for now.
}

export function isValidFileName(fileName: string): { isValid: boolean; message: string } {
    // Remove any leading/trailing whitespace
    const trimmedFileName = fileName.trim();
  
    // Check if the file name is empty
    if (trimmedFileName.length === 0) {
      return { isValid: false, message: "File name cannot be empty." };
    }
  
    // Check if the file name is too long (e.g., max 255 characters)
    if (trimmedFileName.length > 255) {
      return { isValid: false, message: "File name is too long. Maximum 255 characters allowed." };
    }
  
    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
    if (invalidChars.test(trimmedFileName)) {
      return { isValid: false, message: "File name contains invalid characters." };
    }
  
    // Check if the file name starts or ends with a period
    if (trimmedFileName.startsWith('.') || trimmedFileName.endsWith('.')) {
      return { isValid: false, message: "File name cannot start or end with a period." };
    }

    // Check if the file name is a reserved name (Windows specific)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    if (reservedNames.test(trimmedFileName)) {
      return { isValid: false, message: "This is a reserved file name and cannot be used." };
    }
  
    // If all checks pass, the file name is valid
    return { isValid: true, message: "File name is valid." };
  }
