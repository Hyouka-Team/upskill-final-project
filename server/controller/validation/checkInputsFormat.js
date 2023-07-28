/**
 * This function throws an error if the e is falsy
 * @param {*} e 
 * @param {Class} m 
 * @returns 
 * example usecase in the controller:
 *       (() => {
        try {
          _throw(emailPatternCheck(argumentValue), InvalidInputError);
        } catch (error) {
          throw error;
        }
      })();
 */

const isEmailFormatValid = (string) => {
  const regex =
    /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
  const test = regex.test(string);
  if (test) {
    return true;
  } else {
    return false;
  }
};

const isPasswordFormatValid = (string) => {
  /**
       * Criteria:
       * 
              (?=.{8,})        : Length
              (?=.*[a-zA-Z])   : Letters
              (?=.*\d)         : Digits
              (?=.*[!#$%&? "]) : Special characters
       * 
       */
  const regex = /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "]).*$/;
  const test = regex.test(string);
  if (test) {
    return true;
  } else {
    return false;
  }
};

// console.log(isPassStrong("sd!1"));
// console.log(isPassStrong("111!111111"));
// console.log(isPassStrong("111@11df"));
// console.log(isPassStrong("df1234!56"));
// console.log(isPassStrong("dfddddddddd"));

function _throw(e, m) {
  console.log("this is the condition", e);
  if (e) {
    return null;
  }
  console.log("this is the error", m);
  throw m;
}

const isPasswordFormatValidOrThrowError = (password, error) => {
  try {
    _throw(isPasswordFormatValid(password), error);
  } catch (error) {
    console.log("It is an original pass error");
    throw error;
  }
};

const isEmailFormatValidOrThrowError = (email, error) => {
  try {
    _throw(isEmailFormatValid(email), error);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  _throw,
  isEmailFormatValid,
  isPasswordFormatValid,
  isPasswordFormatValidOrThrowError,
  isEmailFormatValidOrThrowError,
};
