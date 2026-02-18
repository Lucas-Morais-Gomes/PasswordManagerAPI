# Estágio 1: Build (Mudei de 8.0 para 10.0)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY ["PasswordManagerAPI.csproj", "./"]
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o out

# Estágio 2: Runtime (Mudei de 8.0 para 10.0)
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 8080
ENTRYPOINT ["dotnet", "PasswordManagerAPI.dll"]