package com.fuswx.distributed.Controller;

import com.fuswx.distributed.Bean.User;
import com.fuswx.distributed.Service.IDeviceService;
import com.fuswx.distributed.Service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.ModelAndView;
import org.thymeleaf.util.StringUtils;

import javax.servlet.http.HttpSession;

@Controller
public class PagesController {

    @Autowired
    private IDeviceService deviceService;

    @Autowired
    private IUserService userService;

    @GetMapping(value={"/","login"})
    public String loginPage(){
        return "login";
    }

    @PostMapping("/login")
    public String login(User user, HttpSession session, Model model){
        User loginUser=userService.findUserByUP(user.getUserName(),user.getPassword());
        //登录成功重定向到main.html；重定向防止表单重复提交
        if (loginUser!=null){
            //把登录成功的用户保存起来
            session.setAttribute("loginUser",loginUser);
            return "redirect:/index.html";
        }else {
            model.addAttribute("msg","账号密码错误");
            //回到登录页面
            return "login";
        }
    }

    @GetMapping("/index.html")
    public ModelAndView mainPage(){
        ModelAndView modelAndView=new ModelAndView();
        modelAndView.addObject("devStatus",deviceService.getAllDevStatus());
        modelAndView.setViewName("index");
        return modelAndView;
    }
}
