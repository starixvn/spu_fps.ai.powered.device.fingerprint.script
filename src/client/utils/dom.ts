/// <reference lib="dom" />

export class DOMUtils {

  public static createHiddenElement(
    container: HTMLElement | HTMLFormElement, 
    diValue: string, 
    id: string, 
    name: string
  ): void {
    let diInput = document.createElement("INPUT") as HTMLInputElement;
    diInput.id = id;
    diInput.name = name;
    diInput.setAttribute("type", "hidden");
    diInput.value = diValue;

    container.appendChild(diInput);
  }

  public static injectValueIntoHiddenField(fieldName: string, value: string): void {
    try {
      let elements = document.getElementsByName(fieldName);
      if (elements != null && elements.length != 0) {
        for (let i = 0; i < elements.length; i++) {
          (elements[i] as HTMLInputElement).value = value;
        }
      }
      else {
        let forms = document.forms;

        if (forms != null && forms.length != 0) {
          for (let i = 0; i < forms.length; i++) {
            this.createHiddenElement(document.forms[i], value, (i == 0 ? fieldName : fieldName + i), fieldName);
          }
        }
        else {
          this.createHiddenElement(document.body, value, fieldName, fieldName);
        }
      }
    } catch (exception) {
      // debug.addException(exception, "injectValueIntoHiddenField");
    }
  }

  public static getElementsByName(name: string): NodeListOf<HTMLElement> {
    return document.getElementsByName(name) as NodeListOf<HTMLElement>;
  }
}
