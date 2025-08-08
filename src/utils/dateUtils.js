import dayjs from 'dayjs';

export const smartDateParser = (dateString) => {
  if (!dateString) return dayjs.invalid();

  let date = dayjs(dateString, { jalali: true }).calendar('jalali');
  if (!dayjs.isDayjs(date) || !date.isValid()) {
    date = dayjs(dateString, 'YYYY-MM-DD');
  }

  return dayjs.isDayjs(date) ? date : dayjs.invalid();
};


// Convert Gregorian DB date to Jalali dayjs object
export const parseDBDateToJalali = (dateString) => {
  if (!dateString) return dayjs();
  const date = dayjs(dateString);
  return date.isValid() ? date : dayjs();
};




// Get current date in Jalali calendar
export const getCurrentJalaliDate = () => {
  return dayjs().calendar('jalali');
};

// Format for display (Jalali with Persian digits)
export const formatJalaliDate = (date) => {
  return date.format('jYYYY/jMM/jDD');
};

// Parse Jalali date string (from DB) to Jalali dayjs object
export const parseJalaliDate = (dateString) => {
  return dayjs(dateString, 'jYYYY-jMM-jDD').calendar('jalali');
};

// Calculate difference in days between two Jalali dates
export const jalaliDateDiff = (date1, date2) => {
  return date1.diff(date2, 'day');
};

// Convert Gregorian DB date to Jalali dayjs object
export const parseDBDate = (dateString) => {
  if (!dateString) return dayjs();
  
  // First parse as Gregorian
  const gregorianDate = dayjs(dateString);
  
  // Then convert to Jalali
  return dayjs(gregorianDate).calendar('jalali');
};

// Get current date in Jalali calendar
export const getNowJalali = () => {
  return dayjs().calendar('jalali');
};

// Format for display
export const formatJalali = (date) => {
  return date.format('jYYYY/jMM/jDD');
};

// Safe date difference in days
export const getDaysDifference = (futureDate, currentDate) => {
  return futureDate.diff(currentDate, 'day');
};

/**
 * @param {object} dateObject 
 * @returns {string} 
 */
export const formatDateForDB = (dateObject) => {
  if (!dateObject) return null;
  return dayjs(dateObject.toDate()).format('YYYY-MM-DD');
};


/**
 * @param {string} dateString 
 * @returns {string}
*/

export const formatDateForDisplay = (dateString) => {
  if (!dateString) return 'تاریخ نامشخص';

  const date = dayjs(dateString);
  return date.isValid() ? date.format('YYYY/MM/DD') : 'تاریخ نامعتبر';
};

