import {
	validateEmail,
	validateNameString,
	validatePhone,
	organizeSchedule,
	fillMissingDays
} from './Utils';

test("Fill schedule days", () => {
	const data = [
		{
			id: 2,
			name: "Tuesday",
			hours: [],
			day: 2
		},
		{
			id: 5,
			name: "Friday",
			hours: [],
			day: 5
		},
	];
	const result = [
		{
			id: 6,
			name: "Monday",
			hours: [],
			day: 1
		},
		{
			id: 2,
			name: "Tuesday",
			hours: [],
			day: 2
		},
		{
			id: 7,
			name: "Wednesday",
			hours: [],
			day: 3
		},
		{
			id: 8,
			name: "Thursday",
			hours: [],
			day: 4
		},
		{
			id: 5,
			name: "Friday",
			hours: [],
			day: 5
		},
	];
	fillMissingDays(data);
	expect(data).toEqual(result);
});

describe("testing regexes", () => {
	test("validating an email", () => {
		const data = [
			"name@gmail.com",
			"nam e@gmail.com",
			"nam1e@gmail.com",
			"laksdjfalksdflk",
		];
		expect(validateEmail(data[0])).toBe(true);
		expect(validateEmail(data[1])).toBe(false);
		expect(validateEmail(data[2])).toBe(true);
		expect(validateEmail(data[3])).toBe(false);
	});

	test("validating the name and surname text fields", () => {
		const data = [
			"sdlkfalksdjfkl",
			"l",
			"sdlfjaskdlflaksdjflkasdjfl1kasj",
			"13123",
			"13123 sdkljfasdkf"
		];
		expect(validateNameString(data[0])).toBe(true);
		expect(validateNameString(data[1])).toBe(true);
		expect(validateNameString(data[2])).toBe(false);
		expect(validateNameString(data[3])).toBe(false);
	})

	test("validate a phone number", () => {
		const data = [
			"0902937",
			"akdsljfakdf",
			"+355684297490",
			"0684297490a"
		];
		expect(validatePhone(data[0])).toBe(false);
		expect(validatePhone(data[1])).toBe(false);
		expect(validatePhone(data[2])).toBe(true);
		expect(validatePhone(data[3])).toBe(false);
	});
});
