export const generateBase64FromImage = (imageFile: File): Promise<string> => {
  const reader = new FileReader();
  const promise: Promise<string> = new Promise((resolve, reject) => {
    reader.onload = (e) => resolve((e.target as FileReader).result as string);
    reader.onerror = (err) => reject(err);
  });

  reader.readAsDataURL(imageFile);
  return promise;
};
