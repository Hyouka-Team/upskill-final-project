const emailPatternCheck = (string) => {
  const regex =
    /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
  const test = regex.test(string);
  if (test) {
    return true;
  } else {
    return false;
  }
};

console.log(emailPatternCheck("sdkf@gmail.com"));
console.log(emailPatternCheck("12daniyalmdhattar@gmail.com"));
console.log(emailPatternCheck("daniya#%mdh.attar@gmail."));
console.log(emailPatternCheck("daniya134mdh.attar@gmail.com"));
console.log(emailPatternCheck("daniyalmdhattar@gmail"));
console.log(emailPatternCheck("daniyalmdh!attar@gmail.com"));
console.log(emailPatternCheck("daniyalmdhatta"));

module.exports = {
  emailPatternCheck,
};
