package org.jiwoo.back.user.service;

import org.jiwoo.back.user.aggregate.entity.User;
import org.jiwoo.back.user.dto.CustomUserDetails;
import org.jiwoo.back.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Autowired
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        User userData = userRepository.findByEmail(email);

        if (userData != null) {

            return new CustomUserDetails(userData);
        }

        throw new UsernameNotFoundException("존재하지 않는 유저입니다.");
    }
}
