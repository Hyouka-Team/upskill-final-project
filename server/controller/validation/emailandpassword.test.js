const {
  isPasswordFormatValid,
  isEmailFormatValid,
} = require("./checkInputsFormat");
describe("Password validation", () => {
  test("sd!dd1", () => {
    expect(isPasswordFormatValid("sd!dd1")).toBeFalsy();
  });
  test("111!111111", () => {
    expect(isPasswordFormatValid("111!111111")).toBeFalsy();
  });
  test("1ddddd1111", () => {
    expect(isPasswordFormatValid("1ddddd1111")).toBeFalsy();
  });
  test("df1234!56", () => {
    expect(isPasswordFormatValid("df1234!56")).toBeTruthy();
  });
});
describe("Email validation", () => {
  test("sddddd@gmail.com", () => {
    expect(isEmailFormatValid("sddddd@gmail.com")).toBeTruthy();
  });
  test("sddddd@gmail.dfk.com", () => {
    expect(isEmailFormatValid("sddddd@gmail.com")).toBeTruthy();
  });
  test("sddddd@gmail.", () => {
    expect(isEmailFormatValid("sddddd@gmail.")).toBeFalsy();
  });
  test("sdddddgmail.com", () => {
    expect(isEmailFormatValid("sdddddgmail.com")).toBeFalsy();
  });
  test("@gmail.com", () => {
    expect(isEmailFormatValid("@gmail.com")).toBeFalsy();
  });
  test("gmailcom", () => {
    expect(isEmailFormatValid("gmailcom")).toBeFalsy();
  });
});
