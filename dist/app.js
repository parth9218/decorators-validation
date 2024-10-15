"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const validations_1 = require("./validations");
class Course {
    constructor(title, price) {
        this.title = title;
        this.price = price;
    }
}
__decorate([
    (0, validations_1.Validators)(validations_1.VALIDATIONS.REQUIRED, validations_1.VALIDATIONS.VALID_NAME)
], Course.prototype, "title", void 0);
__decorate([
    (0, validations_1.Validators)(validations_1.VALIDATIONS.REQUIRED, validations_1.VALIDATIONS.ISNUMBER, validations_1.VALIDATIONS.POSITIVE_LENGTH)
], Course.prototype, "price", void 0);
document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const titleEl = document.getElementById('title');
    const priceEl = document.getElementById('price');
    const title = titleEl.value;
    const price = +priceEl.value;
    const createdCourse = new Course(title, price);
    const validationResult = (0, validations_1.validate)(createdCourse);
    if (!validationResult.isValid) {
        alert(validationResult.errors.join('\n'));
        return;
    }
    console.log(createdCourse);
});
//# sourceMappingURL=app.js.map