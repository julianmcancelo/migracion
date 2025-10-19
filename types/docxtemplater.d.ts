declare module 'docxtemplater' {
  class Docxtemplater {
    constructor(zip: any, options?: any)
    loadZip(zip: any): void
    setData(data: Record<string, any>): void
    render(): void
    getZip(): any
  }
  export default Docxtemplater
}

declare module 'pizzip' {
  class PizZip {
    constructor(content?: any, options?: any)
    file(name: string): any
    generate(options: { type: string; compression?: string }): any
  }
  export default PizZip
}
