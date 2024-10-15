import { validate, ValidationResult, VALIDATIONS, Validators } from "./validations";

class Course {
      @Validators(VALIDATIONS.REQUIRED, VALIDATIONS.VALID_NAME)
      public title: string;
      @Validators(VALIDATIONS.REQUIRED, VALIDATIONS.ISNUMBER, VALIDATIONS.POSITIVE_LENGTH)
      public price: number;

      constructor(title: string, price: number) {
            this.title = title;
            this.price = price;
      }
}

document.querySelector('form')!.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleEl = document.getElementById('title') as HTMLInputElement;
      const priceEl = document.getElementById('price') as HTMLInputElement;

      const title = titleEl.value;
      const price = +priceEl.value;

      const createdCourse = new Course(title, price);
      const validationResult: ValidationResult = validate(createdCourse);
      if (!validationResult.isValid) {
            alert(validationResult.errors.join('\n'));
            return;
      }

      console.log(createdCourse);
});