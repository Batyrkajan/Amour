/// <reference types="nativewind/types" />

declare module "*.png" {
  const value: any;
  export = value;
}

declare module "*.ttf" {
  const value: string;
  export default value;
}
