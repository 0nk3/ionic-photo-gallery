import { Injectable } from "@angular/core";
import {
  Plugins,
  CameraResultType,
  Capacitor,
  FilesystemDirectory,
  CameraPhoto,
  CameraSource,
} from "@capacitor/core";
import { rejects } from "assert";
import { resolve } from "dns";

const { Camera, Filesystem, Storage } = Plugins;
@Injectable({
  providedIn: "root",
})
export class PhotoService {
  public photos: Photo[] = [];
  constructor() {}

  public async addNewToGallery(): Promise<void> {
    const capturePhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });
    const savedImageFile = await this.savePicture(capturePhoto);
    this.photos.unshift(savedImageFile);
  }
  private async savePicture(cameraPhoto: CameraPhoto) {
    const base64Data = await this.readAsBase64(cameraPhoto);
    const fileName = new Date().getTime() + ".jpeg";
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data,
    });
    return {
      filepath: fileName,
      webviewPath: cameraPhoto.webPath,
    };
  }
  async readAsBase64(cameraPhoto: CameraPhoto) {
    const response = await fetch(cameraPhoto.webPath);
    const blob = await response.blob();
    return (await this.convertBlobToBase64(blob)) as string;
  }
  convertBlobToBase64 = (blob: Blob) =>
    // tslint:disable-next-line: no-shadowed-variable
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
}
export interface Photo {
  filepath: string;
  webviewPath: string;
}
