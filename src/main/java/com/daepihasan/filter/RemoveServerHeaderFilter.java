package com.daepihasan.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
@Order(Integer.MIN_VALUE)
public class RemoveServerHeaderFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse res = (HttpServletResponse) response;
        // 체인 이전/이후 모두 한 번 더 설정 (재설정 방지)
        res.setHeader("Server", "");
        chain.doFilter(request, response);
        res.setHeader("Server", "");
    }
}
