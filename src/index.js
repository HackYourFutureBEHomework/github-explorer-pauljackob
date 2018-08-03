"use strict"; 
{
  function fetchJSON(url) {
    return new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "json";
      xhr.onload = () => {
        if (xhr.status < 400) {
          resolve(xhr.response);
        } else {
          reject(xhr.response);
        }
      };
      xhr.onerror = () => reject("Network request failed");
      xhr.send();
    });
  }

  function createAndAppend(name, parent, options = {}) {
    const elem = document.createElement(name);
    parent.appendChild(elem);
    Object.keys(options).forEach(key => {
      const value = options[key];
      if (key === "html") {
        elem.innerHTML = value;
      } else {
        elem.setAttribute(key, value);
      }
    });
    return elem;
  }

  function main(url) {
    const root = document.getElementById("root");
    fetchJSON(url)
      .then(data => {
        const header = createAndAppend("header", root, {class: "header", html: "<h4>HYF Repositories</h4>"});
        const repositorySelect = createAndAppend("select", header, { class: "select"});
        createAndAppend("option", repositorySelect, {class: "option", disabled: '', html: "Click to select a repository"});
       
        data.forEach(repo => {
          createAndAppend("option", repositorySelect, {class: "option",html: repo.name});
        });
        
        const left = createAndAppend("div", root, {class: "repo-div"});
        const right = createAndAppend("div", root, {class: "contributor-div"});
        repositorySelect.addEventListener("change", () => {
          const repo = data.find(r => r.name === repositorySelect.value);
          left.innerHTML = "";
          right.innerHTML = "";
          renderRepo(left, repo);
          renderContributors(right, repo);
        });
      })
      .catch(err => document.getElementById("root").innerHTML = err);
       
  }

  function renderRepo(parent, repo) {
    const $repoName = createAndAppend("ul", parent, { class: "repo-name"});
    const $repoList = createAndAppend("li", $repoName, { class: "repo-list"});
    createAndAppend("a", $repoList, {html: `<strong>Repository:</strong> ${repo.name}`, href: repo.html_url, target: "_blank", class: "repo-link"});
    const $repoDescription = createAndAppend("p", $repoList, { class: "description"});
    $repoDescription.innerHTML = `<strong>Description:</strong> ${ repo.description}`;
    createAndAppend("p", $repoList, {class: "forked",html: `<strong>Forked:</strong> ${repo.forks_count}`});
  }

  function renderContributors(parent, repo) {
    const url = repo.contributors_url;
    fetchJSON(url)
      .then(contributors => {
        const $contributorsList = createAndAppend("ul", parent, {class: "contributor-list",html: "<h5>Contributions</h5>"});
        contributors.forEach(contributor => {
          const $contributorItem = createAndAppend("li", $contributorsList, { class: "contributor-item"});
          createAndAppend("img", $contributorItem, {class: "contributor-avatar",src: contributor.avatar_url});
          createAndAppend("a", $contributorItem, {html: `<h4>${contributor.login}</h4>`,class: "contributor-login", href: contributor.html_url, target: "_blank"});
          createAndAppend("h5", $contributorItem, {class: "contribution", html: contributor.contributions});
        });
      })

      .catch(err => document.getElementById("root").innerHTML = err);

  }

  const HYF_REPOS_URL =
    "https://api.github.com/orgs/HackYourFuture/repos?per_page=100";

  window.onload = () => main(HYF_REPOS_URL);
}