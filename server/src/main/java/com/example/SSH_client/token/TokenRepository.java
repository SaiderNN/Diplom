package com.example.SSH_client.token;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Integer> {

    @Query(value = """
      select t from Token t inner join User u
      on t.user.id = u.id
      where u.id = :id and (t.expired = false or t.revoked = false)
      """)
    List<Token> findAllValidTokenByUser(Integer id);

    // Метод для поиска токена по строке токена
    Optional<Token> findByToken(String token);

    // Метод для проверки существования токена по его строковому значению
    @Query("select count(t) > 0 from Token t where t.token = :token")
    boolean existsByToken(String token);
}
