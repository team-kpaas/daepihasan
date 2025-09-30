package com.daepihasan.interceptor;

import com.daepihasan.util.CmmUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        HttpSession session = request.getSession(false);
        String userId = session == null ? "" : CmmUtil.nvl((String) session.getAttribute("SS_USER_ID"));
        boolean loggedIn = !userId.isEmpty();

        if (loggedIn) {
            return true;
        }

        boolean ajax = "XMLHttpRequest".equalsIgnoreCase(request.getHeader("X-Requested-With"));
        log.info("[AuthInterceptor] 비로그인 접근 차단 URI={}", request.getRequestURI());

        if (ajax) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"result\":0,\"msg\":\"로그인이 필요합니다.\"}");
        } else {
            response.sendRedirect("/user/login");
        }
        return false;
    }
}
