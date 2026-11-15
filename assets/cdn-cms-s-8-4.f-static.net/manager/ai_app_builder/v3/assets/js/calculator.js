// Explain: Handles BMI and calorie calculation logic.
/* Hamed Gym — حاسبة كتلة الجسم والسعرات اليومية */
document.addEventListener('DOMContentLoaded', function () {
    var calcForm = document.getElementById('calcForm');

    if (!calcForm) {
        return;
    }

    var calcResults = document.getElementById('calcResults');
    var calcEmpty = document.getElementById('calcEmpty');
    var calcBmi = document.getElementById('calcBmi');
    var calcBmiTag = document.getElementById('calcBmiTag');
    var calcCalories = document.getElementById('calcCalories');
    var calcNote = document.getElementById('calcNote');
    var calcStatus = document.getElementById('calcStatus');

    var TAG_CLASSES = [
        'calc-score__tag--low',
        'calc-score__tag--ok',
        'calc-score__tag--high',
        'calc-score__tag--obese'
    ];
    var TAG_VARIANTS = {
        low: 'calc-score__tag--low',
        ok: 'calc-score__tag--ok',
        high: 'calc-score__tag--high',
        obese: 'calc-score__tag--obese'
    };
    var GOAL_FACTORS = { lose: 0.85, keep: 1, gain: 1.12 };
    var GOAL_NOTES = {
        lose: 'السعرات محسوبة على أساس هدف تنزيل الوزن',
        keep: 'السعرات محسوبة على أساس تثبيت الوزن',
        gain: 'السعرات محسوبة على أساس هدف تكوين العضل'
    };
    var ACTIVITY_NOTE = 'وعلى أساس نشاط متوسط (3–4 تمرينات في الأسبوع).';

    function showCalcError(message) {
        if (!calcStatus) {
            return;
        }
        calcStatus.textContent = message;
        calcStatus.classList.add('is-visible');
    }

    function hideCalcError() {
        if (!calcStatus) {
            return;
        }
        calcStatus.classList.remove('is-visible');
        calcStatus.textContent = '';
    }

    function bmiCategory(bmi) {
        if (bmi < 18.5) {
            return { key: 'low', label: 'أقل من الوزن الطبيعي' };
        }
        if (bmi < 25) {
            return { key: 'ok', label: 'وزن صحي' };
        }
        if (bmi < 30) {
            return { key: 'high', label: 'زيادة بسيطة في الوزن' };
        }
        return { key: 'obese', label: 'سمنة' };
    }

    function roundToTen(value) {
        return Math.round(value / 10) * 10;
    }

    function renderResult(silent) {
        var height = parseFloat(calcForm.elements.height.value);
        var weight = parseFloat(calcForm.elements.weight.value);
        var age = parseFloat(calcForm.elements.age.value);
        var goal = calcForm.elements.goal.value;

        if (!height || !weight || !age || !goal) {
            if (!silent) {
                showCalcError('اكتب الطول والوزن والسن واختار هدفك الأول.');
            }
            return;
        }

        if (height < 100 || height > 230) {
            if (!silent) {
                showCalcError('الطول لازم يكون بين 100 و 230 سم.');
            }
            return;
        }

        if (weight < 30 || weight > 250) {
            if (!silent) {
                showCalcError('الوزن لازم يكون بين 30 و 250 كجم.');
            }
            return;
        }

        if (age < 12 || age > 90) {
            if (!silent) {
                showCalcError('السن لازم يكون بين 12 و 90 سنة.');
            }
            return;
        }

        hideCalcError();

        var heightM = height / 100;
        var bmi = weight / (heightM * heightM);
        var bmr = (10 * weight) + (6.25 * height) - (5 * age) - 78;
        var tdee = bmr * 1.375;
        var factor = GOAL_FACTORS[goal] || 1;
        var calories = roundToTen(tdee * factor);
        var category = bmiCategory(bmi);

        if (calcBmi) {
            calcBmi.textContent = bmi.toFixed(1);
        }

        if (calcBmiTag) {
            calcBmiTag.textContent = category.label;
            calcBmiTag.classList.remove(TAG_CLASSES[0], TAG_CLASSES[1], TAG_CLASSES[2], TAG_CLASSES[3]);
            var tagClass = TAG_VARIANTS[category.key];
            if (tagClass) {
                calcBmiTag.classList.add(tagClass);
            }
        }

        if (calcCalories) {
            calcCalories.textContent = String(calories);
        }

        if (calcNote) {
            calcNote.textContent = (GOAL_NOTES[goal] || GOAL_NOTES.keep) + ' ' + ACTIVITY_NOTE;
        }

        if (calcEmpty) {
            calcEmpty.hidden = true;
        }

        if (calcResults) {
            calcResults.classList.add('is-visible');
        }
    }

    calcForm.addEventListener('submit', function (event) {
        event.preventDefault();
        renderResult(false);
    });

    function liveUpdate() {
        hideCalcError();
        renderResult(true);
    }

    calcForm.addEventListener('input', liveUpdate);
    calcForm.addEventListener('change', liveUpdate);
});