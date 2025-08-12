// Bootstrap 기반으로 작성된 폼 유효성 검사 공통 함수
const FormValidator = (function () {

    /**
     * 지정된 폼 내의 모든 에러 상태를 초기화
     * @param {string} formSelector - 폼의 CSS 선택자 (예: "#formPw")
     */
    function clearErrors(formSelector) {
        $(`${formSelector} input`)
            .removeClass("is-invalid")
            .removeClass("is-valid");
        $(`${formSelector} .invalid-feedback`).text("");
    }

    /**
     * 특정 입력 필드에 에러 표시
     * @param {string} inputSelector - 에러를 표시할 input의 선택자
     * @param {string} errorSelector - 에러 메시지를 표시할 영역의 선택자
     * @param {string} message - 표시할 에러 메시지
     */
    function setError(inputSelector, errorSelector, message) {
        $(inputSelector)
            .removeClass("is-valid")
            .addClass("is-invalid");
        $(errorSelector).text(message);
    }

    /**
     * 특정 입력 필드에 성공 표시
     * @param {string} inputSelector - 성공 표시할 input의 선택자
     */
    function setSuccess(inputSelector) {
        $(inputSelector)
            .removeClass("is-invalid")
            .addClass("is-valid"); // 성공 시 실패 표시 제거
    }

    // 공통 정규식 모음
    const patterns = {
        name: /^[가-힣]{2,15}$/,  // 2~15자, 한글만
        email: /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i,
        id: /^[a-z][a-z0-9_-]{4,19}$/, // 5~20자, 소문자로 시작, 소문자+숫자+_-
        password: /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()])[a-z\d!@#$%^&*()]{8,20}$/ // 8~20자, 소문자+숫자+특정 특수문자
    };

    // 외부에서 사용 가능하게 공개
    return {
        clearErrors: clearErrors,
        setError: setError,
        setSuccess: setSuccess,
        patterns: patterns
    };
})();
