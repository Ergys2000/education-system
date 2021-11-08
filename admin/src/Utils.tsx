const validateEmail = (string: string): boolean => {
	const regex = /^\S+@\S+\.\S+$/;
	return regex.test(string);
}
const validateNameString = (string: string): boolean => {
	const regex = /^[a-zA-z]{0,30}$/;
	return regex.test(string);
}
const validatePhone = (string: string): boolean => {
	const regex = /^\+?\d{10,14}$/;
	return regex.test(string);
}
const validateGender = (gender: string): boolean => {
    if (gender === "male" || gender==="female")
        return true;
    return false;
}

const organizeSchedule= (hours: any[]): any[] => {
	return[];
}

export {
    validateEmail,
    validateNameString,
    validatePhone,
    validateGender,
		organizeSchedule
};
