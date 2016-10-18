
  export function toCamelCase(str: string) {
    str = str.replace(/\W+(.)/g, (match, chr) => {
            return chr.toUpperCase();
        });
    return str.replace (/(?:^|[-_])(\w)/g, (_, c) => {
        return c ? c.toUpperCase () : "";
      });
  }
