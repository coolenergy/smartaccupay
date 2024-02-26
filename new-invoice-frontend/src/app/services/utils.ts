export async function commonFileChangeEvent(
  fileInput: any,
  acceptFileType: string
) {
  return new Promise((resolve, reject) => {
    let imageError = null;
    if (fileInput.target.files && fileInput.target.files[0]) {
      const max_size = 20971520;
      const allowed_types = ['image/png', 'image/jpeg'];
      const max_height = 15200;
      const max_width = 25600;
      let filepath = fileInput.target.files[0];
      let file_name_tmp = filepath.name;
      let file_arrya = file_name_tmp.split('.');
      let file_extention = file_arrya[file_arrya.length - 1];
      if (
        filepath.type == 'image/webp' ||
        filepath.type == 'image/WEBP' ||
        file_extention.toLowerCase() == 'webp'
      ) {
        resolve({ status: false, message: 'File not supported' });
      } else {
        let fileType = filepath.type.split('/');
        // Check file is supported or not
        if (acceptFileType == 'pdf') {
          if (filepath.type == 'application/pdf') {
            resolve({ status: true, filepath: filepath });
          } else {
            resolve({
              status: false,
              message: 'We accept only PDF Documents.',
            });
          }
        } else if (acceptFileType == 'image') {
          // If picked file is image
          if (fileType[0] == 'image') {
            const reader = new FileReader();
            reader.readAsDataURL(fileInput.target.files[0]);
            reader.onload = (e: any) => {
              const image = new Image();
              image.src = e.target.result;
              image.onload = (rs: any) => {
                const img_height = rs.currentTarget['height'];
                const img_width = rs.currentTarget['width'];
                if (img_height > max_height && img_width > max_width) {
                  imageError =
                    'Maximum dimentions allowed ' +
                    max_height +
                    '*' +
                    max_width +
                    'px';
                  resolve({ status: false, message: imageError });
                } else {
                  const imgBase64Path = e.target.result;
                  resolve({
                    status: true,
                    base64: imgBase64Path,
                    filepath: filepath,
                  });
                }
              };
            };
          } else {
            resolve({ status: false, message: 'File not supported' });
          }
        } else if (fileType[0] == 'image') {
          const reader = new FileReader();
          reader.readAsDataURL(fileInput.target.files[0]);
          reader.onload = (e: any) => {
            const image = new Image();
            image.src = e.target.result;
            image.onload = (rs: any) => {
              const img_height = rs.currentTarget['height'];
              const img_width = rs.currentTarget['width'];
              if (img_height > max_height && img_width > max_width) {
                imageError =
                  'Maximum dimentions allowed ' +
                  max_height +
                  '*' +
                  max_width +
                  'px';
                resolve({ status: false, message: imageError });
              } else {
                const imgBase64Path = e.target.result;
                resolve({
                  status: true,
                  base64: imgBase64Path,
                  filepath: filepath,
                });
              }
            };
          };
        } else {
          // if picked file is except image
          resolve({ status: true, filepath: filepath });
        }
      }
    }
  });
}
