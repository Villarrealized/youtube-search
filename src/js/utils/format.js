import formatDistanceStrict from "date-fns/formatDistanceStrict";

// returns human readable values with a max of 3 numbers
// and a max of 1 decimal with the appropriate suffix
export function fmtCompactNumber(number) {
    let value,
        suffix = "";

    if (number >= 1_000_000_000) {
        value = number / 1_000_000_000;
        suffix = "B";
    } else if (number >= 1_000_000) {
        value = number / 1_000_000;
        suffix = "M";
    } else if (number >= 1_000) {
        value = number / 1_000;
        suffix = "K";
    } else {
        return number.toString();
    }

    let rounded = value.toFixed(1);
    if (rounded.endsWith(".0")) {
        rounded = rounded.slice(0, -2);
    }

    if (rounded.length > 3) {
        rounded = Math.round(value).toString();
    }

    return rounded + suffix;
}

// format a date similar to how YouTube does
// ex. 1 year ago, 2 weeks ago, etc.
export function fmtRelativeDate(dateString) {
    return formatDistanceStrict(new Date(dateString), new Date(), { addSuffix: true });
}
